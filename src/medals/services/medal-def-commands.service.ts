import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { LeanDocument, Model } from 'mongoose';
import {
	MedalDef,
	MedalDefDocument,
} from '../../core/schemas/achievements-def/medal-def.schema';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { assignResourceEntityPrivacy } from '../../util/privacy.helper';
import { CreateMedalDefDto } from '../dto/create-medal-def.dto';
import { DeleteMedalDefDto } from '../dto/delete-medal-def.dto';
import { MedalDefDto, MedalDto } from '../dto/medal.dto';
import { UpdateMedalDefDto } from '../dto/update-medal-def.dto';
import { MedalDefCreatedEvent } from '../events/medal-def-created.event';
import { MedalDefDeletedEvent } from '../events/medal-def-deleted.event';
import { MedalDefUpdatedEvent } from '../events/medal-def-updated.event';
import {
	buffer,
	bufferCount,
	from,
	map,
	Observable,
	of,
	skip,
	switchMap,
	take,
	tap,
} from 'rxjs';
import { ComputeMedalsService } from './compute-medals.service';
import { MedalDocument, PartnerResourceDocument } from 'src/core/schemas/index';

@Injectable()
export class MedalDefCommandsService {
	logger = new Logger(MedalDefCommandsService.name);
	constructor(
		@InjectModel(MedalDef.name)
		protected medalDefModel: Model<MedalDefDocument>,
		protected eventEmitter: EventEmitter2,
		protected resourceService: PartnerResourcesService,
		protected computeMedals: ComputeMedalsService,
	) {}

	async updateMedalDef(medalUpdate: UpdateMedalDefDto) {
		const { resource_id, name, league, ...updates } = medalUpdate;
		const resource = await this.resourceService.get_resource(resource_id);
		const currentLeague = league ?? resource.defaultLeague;

		const exists = await this.medalDefModel.exists({
			resource_id,
			name,
			league: currentLeague,
		});
		if (!exists) {
			throw new NotFoundException(
				`Medal ${name} for ${resource_id} and league: ${currentLeague} not found`,
			);
		}

		this.logger.debug(`Here`);

		const medal: MedalDefDocument | null =
			await this.medalDefModel.findOneAndUpdate(
				{
					resource_id,
					name,
					league: currentLeague,
				},
				{
					$set: updates,
				},
				{
					new: true,
				},
			);
		if (!medal) {
			throw new NotFoundException(
				`Medal ${name} for ${resource_id} and league: ${currentLeague} was not found`,
			);
		}
		await this.eventEmitter.emitAsync(
			MedalDefUpdatedEvent.name,
			new MedalDefUpdatedEvent(medal),
		);

		const medalDefEntity = plainToInstance(MedalDefDto, medal, {
			enableCircularCheck: true,
			excludeExtraneousValues: true,
		});

		return medalDefEntity;
	}

	async deleteMedalDef(deleteMedalDef: DeleteMedalDefDto) {
		const resource = await this.resourceService.get_resource(
			deleteMedalDef.resource_id,
		);

		deleteMedalDef.league = deleteMedalDef.league ?? resource.defaultLeague;

		const exists = await this.medalDefModel.exists({
			resource_id: deleteMedalDef.resource_id,
			name: deleteMedalDef.name,
			league: deleteMedalDef.league,
		});
		if (!exists) {
			throw new NotFoundException(
				`Medal ${deleteMedalDef.name} belonging to resource: ${deleteMedalDef.resource_id} with league: ${deleteMedalDef.league} not found`,
			);
		}

		const medalDef: MedalDefDocument | null =
			await this.medalDefModel.findOneAndDelete({
				...deleteMedalDef,
			});
		if (!medalDef) {
			throw new BadRequestException(
				`Medal ${deleteMedalDef.name} from resource ${deleteMedalDef.resource_id}:${deleteMedalDef.league} not found, cannot be deleted`,
			);
		}
		await this.eventEmitter.emitAsync(
			MedalDefDeletedEvent.name,
			new MedalDefDeletedEvent(medalDef),
		);
		return 1;
	}

	async createMedalDef(medalDef: CreateMedalDefDto) {
		const resource = await this.resourceService.get_resource(
			medalDef.resource_id,
		);

		if (!medalDef.league) {
			medalDef.league = resource.defaultLeague;
		}
		const exists = await this.medalDefModel.exists({
			resource_id: medalDef.resource_id,
			name: medalDef.name,
			league: medalDef.league,
		});
		if (exists) {
			throw new BadRequestException(
				`Medal ${medalDef.name} already exists for resource: ${medalDef.resource_id} and league: ${medalDef.league}`,
			);
		}

		const newMedalDef = new this.medalDefModel({
			...medalDef,
			resource_uri: resource.resource_uri,
		});

		assignResourceEntityPrivacy(resource, newMedalDef);

		await newMedalDef.save();

		await this.eventEmitter.emitAsync(
			MedalDefCreatedEvent.name,
			new MedalDefCreatedEvent(newMedalDef),
		);
		return newMedalDef;
	}

	previewMedalsForDef(
		medalDef: CreateMedalDefDto,
		skipN: number,
		limit: number,
	): Observable<MedalDto[]> {
		const obs$ = from(
			this.resourceService.get_resource(medalDef.resource_id),
		).pipe(
			map((resource: PartnerResourceDocument) => {
				const medalDefDoc: LeanDocument<MedalDefDocument> = {
					_id: undefined,
					name: medalDef.name,
					resource_uri: resource.resource_uri,
					resource_id: medalDef.resource_id,
					league: medalDef.league ?? resource.defaultLeague,
					color: medalDef.color,
					list_terms: medalDef.list_terms,
					score_relative: medalDef.score_relative,
					first_day: medalDef.first_day,
					last_day: medalDef.last_day,
					privacy:
						resource.getLeague(medalDef.league)?.visibility ??
						resource.getLeague(resource.defaultLeague).visibility,
				};
				return medalDefDoc;
			}),
			tap(console.log),
			switchMap(
				this.computeMedals.streamMedalsForMedalDef.bind<
					ComputeMedalsService['streamMedalsForMedalDef']
				>(this.computeMedals),
			),
			tap(console.log),
			skip(skipN),
			take(limit),
			bufferCount(limit),
		);

		return obs$;
	}
}

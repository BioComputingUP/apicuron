import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { DeleteTermDto } from './dto/deleteTerm.dto';
import { UpdateTermDto } from './dto/updateTerm.dto';
import { PartnerResourcesService } from '../resources/partner-resources/services/partner-resources.service';
import { Term, TermDocument } from '../core/schemas/terms.schema';
import { Report, ReportDocument } from '../core/schemas/reports.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateTermDto } from './dto/createTerm.dto';
import {
	ITermDeletedEventPayload,
	ITermUpdatedEventPayload,
	TermDeletedEvent,
	TermUpdatedEvent,
} from './events/events';
import { IResourceEntity } from '../core/interfaces/user-resource-entity';

@Injectable()
export class TermsService {
	constructor(
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected eventEmitter: EventEmitter2,
		protected resourceService: PartnerResourcesService,
	) {}

	/**
	 *
	 * @param term_list list of activity_terms requested
	 * @param resource_id the resource the activity terms belong to
	 * @returns Array of terms that were requested
	 */
	async getTerms(
		term_list: string[],
		filter: FilterQuery<IResourceEntity> & {
			resource_id: string;
			league: string;
		},
	) {
		return await this.termModel
			.find({ term_activity: { $in: term_list }, ...filter })
			.lean();
	}

	async getTerm(activity_term: string, resource_id: string) {
		return await this.termModel.findOne({ activity_term, resource_id });
	}

	async getResourceTerms(
		termFilter: FilterQuery<TermDocument>,
		options: QueryOptions<TermDocument> = {},
	) {
		return await this.termModel.find(termFilter, {}, options);
	}

	async resourceHasTerm(resource_id: string, activity_term: string) {
		return !(await this.termModel.exists({ resource_id, activity_term }));
	}

	async updateTerm(term: UpdateTermDto) {
		// const { resource_id, activity_term, league } = term;

		if (!term.league) {
			const resource = await this.resourceService.get_resource(
				term.resource_id,
			);
			term.league = resource.defaultLeague;
		}
		const exists = await this.termModel.exists({
			resource_id: term.resource_id,
			activity_term: term.activity_term,
			league: term.league,
		});
		if (!exists) {
			throw new BadRequestException(
				`Term ${term.activity_term} from resource ${term.resource_id} from league ${term.league} does not exist`,
			);
		}

		const updatedTerm = await this.termModel.findOneAndUpdate(
			{
				resource_id: term.resource_id,
				activity_term: term.activity_term,
				league: term.league,
			},
			{
				$set: term,
			},
			{ new: true },
		);

		await this.eventEmitter.emitAsync(TermUpdatedEvent, {
			term: updatedTerm,
		} as ITermUpdatedEventPayload);

		return updatedTerm;
	}

	async createTerm(createTerm: CreateTermDto) {
		const { resource_uri, defaultLeague } =
			await this.resourceService.get_resource(createTerm.resource_id);

		if (!createTerm.league) {
			createTerm.league = defaultLeague;
		}

		const exists = await this.termModel.exists({
			resource_id: createTerm.resource_id,
			league: createTerm.league,
			activity_term: createTerm.activity_term,
		});
		if (exists) {
			throw new BadRequestException(
				`Term ${createTerm.activity_term} from resource ${createTerm.resource_id} from league ${createTerm.league} already exists`,
			);
		}

		const termDocument = await this.termModel.create({
			...createTerm,
			resource_uri,
		});
		return termDocument.save();
	}

	async deleteTerm(term: DeleteTermDto) {
		if (!term.league) {
			const resource = await this.resourceService.get_resource(
				term.resource_id,
			);
			term.league = resource.defaultLeague;
		}
		const response = await this.termModel.deleteOne(term);

		if (response.deletedCount == 1) {
			await this.eventEmitter.emitAsync(
				TermDeletedEvent.name,
				new TermDeletedEvent(term),
			);
			return true;
		} else {
			throw new InternalServerErrorException(`Failed to delete term ${term}`);
		}
	}
}

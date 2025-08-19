import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { assertIsDefined } from 'src/util/type-assertion.helper';
import { IResourceEntity } from '../core/interfaces/user-resource-entity';
import { Report, ReportDocument } from '../core/schemas/reports.schema';
import { Term, TermDocument } from '../core/schemas/terms.schema';
import { PartnerResourcesService } from '../resources/partner-resources/services/partner-resources.service';
import { CreateTermDto } from './dto/createTerm.dto';
import { DeleteTermDto } from './dto/deleteTerm.dto';
import { UpdateTermDto } from './dto/updateTerm.dto';
import { TermDeletedEvent, TermUpdatedEvent } from './events/events';
import { getRelatedReportFilter } from './helpers/related-report';

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

	async updateTerm(termUpdate: UpdateTermDto) {
		// const { resource_id, activity_term, league } = term;

		if (!termUpdate.league) {
			const resource = await this.resourceService.get_resource(
				termUpdate.resource_id,
			);
			termUpdate.league = resource.defaultLeague;
		}
		const oldTerm = await this.termModel.findOne({
			resource_id: termUpdate.resource_id,
			activity_term: termUpdate.activity_term,
			league: termUpdate.league,
		});
		if (!oldTerm) {
			throw new BadRequestException(
				`Term ${termUpdate.activity_term} from resource ${termUpdate.resource_id} from league ${termUpdate.league} does not exist`,
			);
		}

		const updatedTerm = await this.termModel.findOneAndUpdate(
			{
				resource_id: termUpdate.resource_id,
				activity_term: termUpdate.activity_term,
				league: termUpdate.league,
			},
			{
				$set: termUpdate,
			},
			{ new: true },
		);
		assertIsDefined(
			updatedTerm,
			`Failed to update term ${termUpdate.activity_term} from resource ${termUpdate.resource_id} from league ${termUpdate.league}`,
		);
		await this.eventEmitter.emitAsync(
			TermUpdatedEvent.name,
			new TermUpdatedEvent(oldTerm, updatedTerm),
		);

		return updatedTerm;
	}

	async createTerm(createTerm: CreateTermDto) {
		const resource = await this.resourceService.get_resource(
			createTerm.resource_id,
		);

		const { resource_uri, defaultLeague } = resource;

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
		const privacy = resource.getLeague(createTerm.league)?.visibility;
		assertIsDefined(
			privacy,
			`League ${createTerm.league} does not exist on resource ${createTerm.resource_id}`,
		);
		const termDocument = await this.termModel.create({
			...createTerm,
			privacy, //FIXME: Something weird here
			resource_uri,
		});
		return termDocument.save();
	}

	async deleteTerm(deleteTerm: DeleteTermDto) {
		if (!deleteTerm.league) {
			const resource = await this.resourceService.get_resource(
				deleteTerm.resource_id,
			);
			deleteTerm.league = resource.defaultLeague;
		}
		const term = await this.termModel.findOneAndDelete(deleteTerm);

		if (!!term) {
			await this.reportModel.deleteMany(getRelatedReportFilter(term));

			await this.eventEmitter.emitAsync(
				TermDeletedEvent.name,
				new TermDeletedEvent(term),
			);
			return true;
		} else {
			throw new InternalServerErrorException(
				`Failed to delete term ${deleteTerm.activity_term} from resource ${deleteTerm.resource_id}`,
			);
		}
	}
}

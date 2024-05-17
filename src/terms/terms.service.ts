import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { DeleteTermDto } from './dto/deleteTerm.dto';
import { UpdateTermDto } from './dto/updateTerm.dto';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
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
		const { resource_id, activity_term, league } = term;

		if (!league) {
			const resource = await this.resourceService.get_resource(
				term.resource_id,
			);
			term.league = resource.defaultLeague;
		}

		const updatedTerm = await this.termModel.findOneAndUpdate(
			{ resource_id, activity_term, league },
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

	async createTerm(term: CreateTermDto) {
		const { resource_uri, defaultLeague } =
			await this.resourceService.get_resource(term.resource_id);

		if (!term.league) {
			term.league = defaultLeague;
		}
		const termDocument = await this.termModel.create({ ...term, resource_uri });
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

		await this.eventEmitter.emitAsync(TermDeletedEvent, {
			term,
		} as ITermDeletedEventPayload);

		if (response.deletedCount == 1) {
			return true;
		} else {
			return false;
		}
	}
}

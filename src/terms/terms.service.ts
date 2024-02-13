import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, QueryOptions } from 'mongoose';
import { DeleteTermDto } from './dto/deleteTerm.dto';
import { TermDto, TermFilterDto } from './dto/term.dto';
import { UpdateTermDto } from './dto/updateTerm.dto';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { Term, TermDocument } from '../core/schemas/terms.schema';
import { Report, ReportDocument } from '../core/schemas/reports.schema';
import {
	AchievementDef,
	AchievementDefDocument,
} from '../core/schemas/achievements-def/achievement-def.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ON_TERM_DELETED, ON_TERM_UPDATED } from './constants';
import { CreateTermDto } from './dto/createTerm.dto';
import { ResourceEntity } from '../core/schemas/components/resource-entity.schema';

@Injectable()
export class TermsService {
	constructor(
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		// @InjectModel(AchievementDef.name)
		// protected achievementDefModel: Model<AchievementDefDocument>,
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
		filter: FilterQuery<ResourceEntity> & {
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

		const updated_term = await this.termModel.findOneAndUpdate(
			{ resource_id, activity_term },
			{
				$set: term,
			},
			{ new: true },
		);

		await this.eventEmitter.emitAsync(ON_TERM_UPDATED, updated_term);

		return updated_term;
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

		await this.eventEmitter.emitAsync(ON_TERM_DELETED, term);

		if (response.deletedCount == 1) {
			return true;
		} else {
			return false;
		}
	}
}

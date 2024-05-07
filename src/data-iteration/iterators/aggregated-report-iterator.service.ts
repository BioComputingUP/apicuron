import { Injectable } from '@nestjs/common';
import { Aggregate, FilterQuery, Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cache } from '@nestjs/cache-manager';
import {
	BaseAggregationResult,
	DetailedAggregationResult,
} from '../../data-aggregation/interfaces/aggregation-results';
import { BaseReportIteratorResult } from '../interfaces/base-report-iterator-result';
import { Iterator } from '../interfaces/iterator.interface';

@Injectable()
export class AggregatedReportIteratorService
	implements
		Iterator<
			BaseAggregationResult,
			BaseReportIteratorResult<DetailedAggregationResult>
		>
{
	constructor(
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		protected cacheManager: Cache,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
	) {}

	defaultCacheTTl = 10;
	private async getTerm(
		termFilter: FilterQuery<TermDocument> & {
			resource_id: string;
			activity_term: string;
			league: string;
		},
	): Promise<TermDocument> {
		const { resource_id, activity_term, league } = termFilter;
		const getTermKey = (
			resource_id: string,
			activity_term: string,
			league: string,
		) => `term: ${resource_id}:${activity_term}:${league}`;
		const termKey = getTermKey(
			termFilter.resource_id,
			termFilter.activity_term,
			termFilter.league,
		);
		const cachedTerm = (await this.cacheManager.get(
			termKey,
		)) as TermDocument | null;
		if (cachedTerm) {
			return cachedTerm;
		}

		const terms = await this.termModel.find({ resource_id });
		let resultTerm: TermDocument | null = null;

		const cacheEvents$ = [];
		for (const term of terms) {
			if (term.activity_term == activity_term && term.league == league) {
				resultTerm = term;
			}
			const cacheEvent$ = this.cacheManager.set(
				getTermKey(resource_id, term.activity_term, term.league),
				term,
				this.defaultCacheTTl,
			);
			cacheEvents$.push(cacheEvent$);
		}
		await Promise.all(cacheEvents$);
		if (!resultTerm) {
			throw new Error(
				`Term ${activity_term} from resource ${resource_id} not found`,
			);
		}

		return resultTerm;
	}

	async *iterate(
		aggregation: Aggregate<BaseAggregationResult | DetailedAggregationResult>,
	): AsyncGenerator<BaseReportIteratorResult<DetailedAggregationResult>> {
		const cursor = aggregation.cursor({ batchSize: 100 });
		let currentResource: PartnerResourceDocument | null = null;
		let currentUser: UserDocument | null = null;

		for await (const report of cursor) {
			if (
				!currentResource ||
				currentResource.resource_id !== report.resource_id
			) {
				currentResource = await this.resourceModel.findOne({
					resource_id: report.resource_id,
				});
			}

			if (!currentUser || currentUser.orcid_id !== report.curator_orcid) {
				currentUser = await this.userModel.findOne({
					curator_orcid: report.curator_orcid,
				});
			}

			const term = await this.getTerm({
				resource_id: report.resource_id,
				activity_term: report.activity_term,
				league: report.league,
			});
			yield {
				term,
				resource: currentResource,
				user: currentUser,
				report: report,
			};
		}
	}
}

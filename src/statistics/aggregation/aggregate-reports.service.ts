import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Aggregate, FilterQuery, Model } from 'mongoose';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { User, UserDocument } from '../../core/schemas/user.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { PrivacyType } from '../../core/enums';

export interface BaseAggregationResult {
	_id: {
		resource_id: string;
		curator_orcid: string;
		league: string;
		activity_term: string;
	};
	resource_id: string;
	curator_orcid: string;
	privacy: PrivacyType;
	league: string;
	activity_term: string;
	count: number;
	last_contribution: Date;
	first_contribution: Date;
}

export type BaseReportIteratorResult<T> = {
	term: TermDocument;
	resource: PartnerResourceDocument;
	report: T;
};
@Injectable()
export class StatisticsReportAggregator {
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		@Inject(CACHE_MANAGER) protected cacheManager: Cache,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
	) {}

	aggregate(
		filter: FilterQuery<ReportDocument>,
	): Aggregate<BaseAggregationResult[]> {
		return this.reportModel
			.aggregate()
			.match(filter)
			.group({
				_id: {
					resource_id: '$resource_id',
					curator_orcid: '$curator_orcid',
					league: '$league',
					activity_term: '$activity_term',
				},
				privacy: {
					$first: '$privacy',
				},
				resource_id: {
					$first: '$resource_id',
				},
				curator_orcid: {
					$first: '$curator_orcid',
				},
				league: {
					$first: '$league',
				},
				activity_term: {
					$first: '$activity_term',
				},
				count: {
					$sum: 1,
				},
				last_contribution: {
					$max: '$timestamp',
				},
				first_contribution: {
					$min: '$timestamp',
				},
			})
			.sort({
				resource_id: -1,
				curator_orcid: -1,
				league: -1,
				activity_term: -1,
			}) as unknown as Aggregate<BaseAggregationResult[]>;
	}

	defaultCacheTTl = 10;
	async getTerm(
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
				`Term ${activity_term} from resource ${resource_id}:${league} not found`,
			);
		}

		return resultTerm;
	}

	async *iterate(
		filter: FilterQuery<ReportDocument> = {},
	): AsyncGenerator<BaseReportIteratorResult<BaseAggregationResult>> {
		const cursor = this.aggregate(filter).cursor({ batchSize: 100 });
		let currentResource: PartnerResourceDocument | null = null;

		for await (const report of cursor) {
			if (
				!currentResource ||
				currentResource.resource_id !== report.resource_id
			) {
				currentResource = await this.resourceModel.findOne({
					resource_id: report.resource_id,
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
				report: report,
			};
		}
	}
}

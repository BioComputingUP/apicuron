import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { mapKeys, pick } from 'lodash';
import { FilterQuery, Model, PipelineStage, QueryOptions } from 'mongoose';
import { UsersService } from '../auth/users/services/users.service';
import { ReportModel, Report, ReportDocument } from '../core/schemas/reports.schema';
import { paginate } from '../pagination/paginator';
import { PartnerResourcesService } from '../resources/partner-resources/services/partner-resources.service';
import { TermsService } from '../terms/terms.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportWithTermDto } from './dto/report.dto';
@Injectable()
export class ReportsService {
	constructor(
		@InjectModel(Report.name)
		private reportModel: ReportModel,
		protected partnerResourcesService: PartnerResourcesService,
		protected userService: UsersService,
		protected termsService: TermsService,
	) {}

	logger = new Logger(ReportsService.name);

	async getUserReports(orcid_id: string): Promise<Report[]> {
		return await this.reportModel.find({
			curator_orcid: orcid_id,
		});
	}

	/**
	 *
	 * @param resource_id The local resource_id of the specified resource
	 * @description This function aggregates the reports, groups them by orcid and term
	 * @returns Aggregate<any[]>
	 */
	group_resource_reports_by_activities(resource_id: string) {
		// # this query groups reports by user and activity_terms
		// # computes the count of each term creating a list of (term, count) pairs
		const aggregation_pipeline = [
			{
				$match: {
					resource_id,
				},
			},
			{
				$group: {
					_id: {
						curator_orcid: '$curator_orcid',
						activity_term: '$activity_term',
					},
					count: {
						$sum: 1,
					},
					activity_term: {
						$first: '$activity_term',
					},
					curator_orcid: {
						$first: '$curator_orcid',
					},
				},
			},
			{
				$group: {
					_id: {
						curator_orcid: '$curator_orcid',
					},
					terms: {
						$addToSet: {
							activity_term: '$activity_term',
							count: '$count',
						},
					},
				},
			},
		];

		return this.reportModel.aggregate(aggregation_pipeline);
	}

	/**
	 *import { BasicGroupByOptions } from 'rxjs';

	 * @param resource_id the resource_id concerned
	 * @param orcid_id the orcid of the user
	 * @description returns a cursor to the user reports on the resource_id done by the user with the specified orcid_id
	 * @returns a cursor to the reports of the orcid_id done on the resource
	 */
	user_resource_reports(resource_id: string, orcid_id: string) {
		return this.reportModel.find({
			resource_id,
			curator_orcid: orcid_id,
		});
	}

	async getReports(
		reportFilter: ReportFilterDto,
		privacyFilter: FilterQuery<Report> = {},
	) {
		const { filter, options } = this.buildReportsQuery(reportFilter);

		const query: FilterQuery<ReportDocument> = {
			$and: [filter, privacyFilter],
		};

		if (!reportFilter.league && !!reportFilter.resource_id) {
			const resource = await this.partnerResourcesService.get_resource(
				reportFilter.resource_id,
			);
			reportFilter.league = resource.defaultLeague;
			query.league = reportFilter.league;
		}

		const projection = reportFilter.extend.includes('term')
			? null
			: { term: 0 };

		const reports = await this.reportModel
			.find(query, projection, options)
			.lean();
		const data = reports;

		const reports_count: number = await this.reportModel.count(query);

		return paginate<ReportWithTermDto>(
			ReportWithTermDto,
			data,
			reportFilter,
			reports_count,
		);
	}

	async all_reports_count() {
		return await this.reportModel.count();
	}

	private buildReportsQuery(dto: ReportFilterDto): {
		filter: FilterQuery<Report>;
		options: QueryOptions<Report>;
	} {
		let filter: FilterQuery<Report> = pick(dto, [
			'entity_uri',
			'curator_orcid',
			'resource_id',
		]);
		if (dto.activity_terms && dto.activity_terms.length > 0) {
			filter.activity_term = {
				$in: dto.activity_terms,
			};
		}

		// timestamp filter object
		// pick the keys from the dto and rename them if they're defined
		const timestamp = mapKeys(pick(dto, ['from', 'to']), (value, key) => {
			const rename = { from: '$gte', to: '$lte' };
			return rename[key];
		});

		if (Object.keys(timestamp).length > 0) {
			filter = {
				...filter,
				timestamp,
			};
		}

		const sort = {};
		const converter = {
			desc: -1,
			asc: 1,
			'1': 1,
			'-1': -1,
		};
		if (dto.sortBy) sort[dto.sortBy] = converter[dto.sortOrder ?? -1];

		const options: QueryOptions<Report> = {
			sort,
		};

		Object.assign(options, dto.getMongoQueryOptions());

		return {
			filter,
			options,
		};
	}

	private queryOptionsToPipeline(options: QueryOptions<Report>) {
		const pipelineArray: PipelineStage[] = [];

		if (options.sort) {
			pipelineArray.push({ $sort: options.sort });
		}

		if (options.skip) {
			pipelineArray.push({ $skip: options.skip });
		}

		if (options.limit) {
			pipelineArray.push({ $limit: options.limit });
		}

		return pipelineArray;
	}
}

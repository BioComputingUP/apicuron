import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	FilterQuery,
	InsertManyResult,
	Model,
	PipelineStage,
	QueryOptions,
} from 'mongoose';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { TermsService } from '../terms/terms.service';
import {
	ReportFilterDto,
	ReportFilterGroupedDto,
} from './dto/report-filter.dto';
import { Report, ReportDocument } from '../core/schemas/reports.schema';
import * as _ from 'lodash';
import { paginate } from '../pagination/paginator';
import { PaginationAggregation } from '../pagination/interfaces/pagination-aggregation';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
	REPORTS_DELETED_ALL_RESOURCE,
	ON_REPORTS_INSERT,
	ON_REPORT_INSERT,
} from './constants';
import { ReportDto } from './dto/report.dto';
import { DeleteResult } from 'mongodb';
import { UPDATE_USER_PRIVACY } from '../statistics/constants';
import { ON_TERM_DELETED } from '../terms/constants';
import { Term } from '../core/schemas/terms.schema';

@Injectable()
export class ReportsService {
	constructor(
		@InjectModel(Report.name)
		private reportModel: Model<ReportDocument>,
		protected partnerResourcesService: PartnerResourcesService,
		protected termsService: TermsService,
		private eventEmitter: EventEmitter2,
	) {}

	logger = new Logger(ReportsService.name);

	@OnEvent(UPDATE_USER_PRIVACY, { async: true })
	async updateReportsPrivacy({ orcid_id, privacy }) {
		const result = await this.reportModel.updateMany(
			{ curator_orcid: orcid_id },
			{ $set: { privacy } },
		);

		return result;
	}

	async getUserReports(orcid_id: string): Promise<Report[]> {
		return await this.reportModel.find({
			curator_orcid: orcid_id,
		});
	}

	async insertReport(report: ReportDto, preventEvents = false) {
		try {
			const instance = new this.reportModel(report);
			await instance.save();
			if (!preventEvents) {
				await this.eventEmitter.emitAsync(
					ON_REPORT_INSERT,
					report as ReportDto,
				);
			}
			return instance;
		} catch (e: any) {
			this.logger.error(e.message, e.stack, 'insertReport');
			throw new Error(`Failed to save Report ${report}`);
		}
	}

	async insertReports(
		reports: ReportDto[],
		preventEvents = false,
	): Promise<Omit<InsertManyResult<Report>, 'insertedIds'>> {
		try {
			const { insertedCount, acknowledged } = await this.reportModel.insertMany(
				reports,
				{ rawResult: true },
			);
			if (!preventEvents) {
				await this.eventEmitter.emitAsync(
					ON_REPORTS_INSERT,
					reports as ReportDto[],
				);
			}
			return {
				insertedCount,
				acknowledged,
			};
		} catch (e: any) {
			this.logger.error(e.message, e.stack, 'insertReports');
			this.logger.error(
				`A MongoBulkWriteException occurred when inserting Reports, but there are successfully processed documents.`,
			);
		}
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
		request_orcid: string | null = null,
		allowedResources: string[] = [],
	) {
		const { filter, options } = this.buildReportsQuery(reportFilter);

		const privacyFilters: FilterQuery<any>[] = [
			{ resource_id: { $in: allowedResources } },
			{ privacy: 'public' },
		];
		if (!!request_orcid) {
			privacyFilters.push({
				curator_orcid: request_orcid,
			});
		}

		const query = {
			$and: [
				filter,
				{
					$or: privacyFilters,
				},
			],
		};

		const reports = await this.reportModel.find(query, {}, options).lean();
		let data = reports;

		if (reportFilter.extend.includes('term')) {
			const { resource_id } = reportFilter;

			const activity_term_list = [
				...new Set(reports.map((report) => report.activity_term)),
			];

			const terms_list = await this.termsService.get_terms(
				activity_term_list,
				resource_id,
			);

			const reports_with_terms = reports.map((report) => {
				report['term'] = terms_list.find(
					(term) => term.activity_term == report.activity_term,
				);
				return report;
			});
			data = reports_with_terms;
		}

		const reports_count: number = await this.reportModel.count(query);

		return paginate(data, reportFilter, reports_count);
	}

	async getGroupedReports(reportFilter: ReportFilterGroupedDto) {
		const { filter, options } = this.buildReportsQuery(reportFilter);

		const [paginationPipeline, limitAggregation]: PaginationAggregation =
			reportFilter.getMongoAggregation();
		const groupByAggregation: PipelineStage[] =
			this.buildReportGroupAggregation(reportFilter);

		const aggregationPipeline: PipelineStage[] = [
			{ $match: filter },
			...groupByAggregation,
			paginationPipeline,
		];
		const data$ = this.reportModel.aggregate(aggregationPipeline);
		const reports_count$ = this.reportModel.aggregate([
			...aggregationPipeline.filter((stage) => !stage['$limit']), // remove the stage that limits the data for counting
			{ $count: 'total_count' },
		]);

		const [data, reports_count] = await Promise.all([data$, reports_count$]);

		const totalCount: number = reports_count[0]?.['total_count'] || 0;

		return paginate(data, reportFilter, totalCount);
	}

	async all_reports_count() {
		return await this.reportModel.count();
	}

	async deleteAllResourceReports(resource_id: string): Promise<DeleteResult> {
		const { deletedCount, acknowledged } = await this.reportModel.deleteMany({
			resource_id,
		});
		this.eventEmitter.emit(REPORTS_DELETED_ALL_RESOURCE, {
			resource_id,
			deletedCount,
			acknowledged,
		});
		return { deletedCount, acknowledged };
	}

	async deleteAllResourcesReports(
		resource_ids: string[],
	): Promise<{ [key: string]: DeleteResult }> {
		// delete all the reports of all resources in order
		const deleteResponses$ = resource_ids.map(async (resource_id: string) => {
			return await this.deleteAllResourceReports(resource_id);
		});

		// await for all promises in order
		const deleteResponses = await Promise.all(deleteResponses$);
		// Create an object where each key is a resource id and the value is the response object;
		return resource_ids.reduce((prev, curr, index) => {
			prev[curr] = deleteResponses[index];
			return prev;
		}, {});
	}

	private buildReportsQuery(dto: ReportFilterDto): {
		filter: FilterQuery<Report>;
		options: QueryOptions<Report>;
	} {
		let filter: FilterQuery<Report> = _.pick(dto, [
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
		const timestamp: any = _.mapKeys(
			_.pick(dto, ['from', 'to']),
			(value, key) => {
				const rename = { from: '$gte', to: '$lte' };
				return rename[key];
			},
		);

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
		sort[dto.sortBy] = converter[dto.sortOrder];

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

	private buildReportGroupAggregation({
		groupBy,
		sortOrder,
	}: ReportFilterGroupedDto): PipelineStage[] {
		const converter = {
			day: [
				{
					$group: {
						_id: { $dateToString: { date: '$timestamp', format: '%Y-%m-%d' } },
						reports: {
							$push: {
								activity_term: '$activity_term',
								resource_id: '$resource_id',
								curator_orcid: '$curator_orcid',
								timestamp: '$timestamp',
								entity_uri: '$entity_uri',
							},
						},
						count: { $sum: 1 },
					},
				},
				{
					$project: {
						groupKey: '$_id',
						_id: 0,
						reports: 1,
						count: 1,
					},
				},
				{
					$sort: {
						groupKey: sortOrder as any,
					},
				},
			],
			month: [
				{
					$group: {
						_id: { $dateToString: { date: '$timestamp', format: '%Y-%m' } },
						reports: {
							$push: {
								activity_term: '$activity_term',
								resource_id: '$resource_id',
								curator_orcid: '$curator_orcid',
								timestamp: '$timestamp',
								entity_uri: '$entity_uri',
							},
						},
						count: { $sum: 1 },
					},
				},
				{
					$project: {
						groupKey: '$_id',
						_id: 0,
						reports: 1,
						count: 1,
					},
				},
				{
					$sort: {
						groupKey: sortOrder as any,
					},
				},
			],
			activity_term: [
				{
					$group: {
						_id: '$activity_term',
						reports: {
							$push: {
								activity_term: '$activity_term',
								resource_id: '$resource_id',
								curator_orcid: '$curator_orcid',
								timestamp: '$timestamp',
								entity_uri: '$entity_uri',
							},
						},
						count: { $sum: 1 },
					},
				},
				{
					$project: {
						groupKey: '$_id',
						_id: 0,
						reports: 1,
						count: 1,
					},
				},
				{
					$sort: {
						groupKey: sortOrder as any,
					},
				},
			],
		};
		return converter[groupBy];
	}

	@OnEvent(ON_TERM_DELETED, { async: true })
	async deleteTermReports(term: Term) {
		return await this.reportModel.deleteMany({
			resource_id: term.resource_id,
			activity_term: term.activity_term,
		});
	}
}

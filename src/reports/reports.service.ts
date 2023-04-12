import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, QueryOptions } from 'mongoose';
import { User, UserDocument } from '../auth/users/schemas/user.schema';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { TermsService } from '../terms/terms.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportDto } from './dto/report.dto';
import { Report, ReportDocument, ReportSchema } from './reports.schema';
import * as _ from 'lodash';
import { plainToClass } from 'class-transformer';
import { writeFileSync } from 'fs';

@Injectable()
export class ReportsService {
	constructor(
		@InjectModel(Report.name)
		private reportModel: Model<ReportDocument, {}, {}, {}, typeof ReportSchema>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		protected partnerResourceService: PartnerResourcesService,
		protected termsService: TermsService,
	) {}

	private checkOrcidId(orcid_id: string): Boolean {
		// TODO: This needs to be implemented
		return true;
	}

	async getUserReports(orcid_id: string): Promise<Report[]> {
		return await this.reportModel.find({
			curator_orcid: orcid_id,
		});
	}

	async insertReport(report: ReportDto) {
		return await this.reportModel.insertMany(report);
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
	 *
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

	async get_reports(reportFilter: ReportFilterDto, with_terms = false) {
		const { resource_id } = reportFilter;
		const { filter, options } = this.buildReportsQuery(reportFilter);

		if (!reportFilter.groupBy) {
			console.log(options)
			const reports = await this.reportModel.find(filter, {}, options).lean();
			let data = reports;

			if (with_terms) {
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

			const reports_count = await this.reportModel.count(filter);

			return {
				data,
				total_count: reports_count,
				page: reportFilter.page,
				page_size: reportFilter.page_size,
			};
		} else {
			const paginationPipeline = this.queryOptionsToPipeline(options);
			const groupByAggregation = this.buildReportGroupAggregation(reportFilter.groupBy)

			console.log(paginationPipeline)

			const aggregationPipeline: PipelineStage[] = [
				{ $match: filter },
				...groupByAggregation,
				...paginationPipeline
			]
			const data$ = this.reportModel.aggregate(aggregationPipeline);
			const reports_count$ = this.reportModel.aggregate([
				...aggregationPipeline.filter(stage => !stage['$limit']), // remove the stage that limits the data for counting
				{ $count: 'total_count' }
			]);
			
			const [data, reports_count] = await Promise.all([data$, reports_count$]);
			return {
				data,
				total_count: reports_count[0]['total_count'],
				page: reportFilter.get_page(),
				page_size: reportFilter.get_page_size(),
			};
		}
	}

	async report_statistics() {}

	async all_reports_count() {
		return await this.reportModel.count();
	}

	async delete_all_resource_reports(resource_id: string) {
		const resource_uri = await this.partnerResourceService.retrieve_uri(
			resource_id,
		);

		return await this.reportModel.deleteMany({
			$or: [{ resource_uri }, { resource_id }],
		});
	}

	private buildReportsQuery(dto: ReportFilterDto): {
		filter: FilterQuery<Report>;
		options: QueryOptions<Report>;
	} {
		let filter: FilterQuery<Report> = _.pick(dto, [
			'entity_uri',
			'curator_orcid',
			'resource_id',
			'activity_term',
		]);

		// timestamp filter object
		// pick the keys from the dto and rename them if they're defined
		let timestamp: any = _.mapKeys(
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

		let sort = {};
		const converter = {
			desc: -1,
			asc: 1,
			'1': 1,
			'-1': -1,
		};
		sort[dto.sortBy] = converter[dto.sortOrder];

		let options: QueryOptions<Report> = {
			sort,
		};

		// pagination objects
		if(dto.get_page_size()){
			options['limit'] = dto.get_page_size()
			options['skip'] = (dto.get_page() - 1) * options['limit'];	
		}

		return {
			filter,
			options,
		};
	}

	private queryOptionsToPipeline(options: QueryOptions<Report>) {
		let pipelineArray: PipelineStage[] = [];

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

	private buildReportGroupAggregation(
		groupBy: string,
	): PipelineStage[] {
		const converter = {
			'date': [
				{
					$group: {
						_id: { $dateToString: { date: '$timestamp', format: '%Y-%m-%d' } },
						activity_terms: { $addToSet: '$activity_term' },
						resource_ids: { $addToSet: '$resource_id' },
						curator_orcids: { $addToSet: '$curator_orcid' },
						timestamps: { $addToSet: '$timestamp' },
						count: { $sum: 1 }
					},
				},
				{
					$project: {
						date: '$_id',
						_id: 0,
						activity_terms: 1,
						resource_ids: 1,
						curator_orcids: 1,
						timestamps: 1,
						count: 1
					},
				},
			],
			'activity_term': [
				{
					$group: {
						_id: '$activity_term',
						timestamps: { $addToSet: '$timestamp' },
						resource_ids: { $addToSet: '$resource_id' },
						curator_orcids: { $addToSet: '$curator_orcid' },
						count: { $sum: 1 }
					},
				},
				{
					$project: {
						_id: 0,
						activity_term: '$_id',
						timestamps: 1,
						resource_ids: 1,
						curator_orcids: 1,
						count: 1
					},
				},
			],
		};

		return converter[groupBy];
	}
}

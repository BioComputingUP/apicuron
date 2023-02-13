import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Aggregate, FilterQuery, Model, Schema } from 'mongoose';
import { User, UserDocument } from '../auth/users/schemas/user.schema';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { TermsService } from '../terms/terms.service';
import { ReportFilterDto } from './dto/report-filter.dto';
import { ReportDto } from './dto/report.dto';
import { Report, ReportDocument } from './reports.schema';


@Injectable()
export class ReportsService {
	constructor(
		@InjectModel(Report.name) private reportModel: Model<ReportDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		protected partnerResourceService: PartnerResourcesService,
		protected termsService: TermsService,
	) { }

	private page_size = 10;

	private sort_fields = [
		'entity_uri',
		'activity_name',
		'description',
		'timestamp',
	];

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
				'$match': {
					resource_id
				}
			},
			{
				'$group': {
					'_id': {
						'curator_orcid': '$curator_orcid',
						'activity_term': '$activity_term'
					},
					'count': {
						'$sum': 1
					},
					'activity_term': {
						'$first': '$activity_term'
					},
					'curator_orcid': {
						'$first': '$curator_orcid'
					}
				}
			},
			{
				'$group': {
					'_id': {
						'curator_orcid': '$curator_orcid'
					},
					'terms': {
						'$addToSet': {
							'activity_term': '$activity_term',
							'count': '$count'
						}
					}
				}
			}
		]

		return this.reportModel.aggregate(aggregation_pipeline)
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
			curator_orcid: orcid_id
		})

	}


	async get_reports(reportFilter: ReportFilterDto) {
		const {filter, options} = ReportFilterDto.makeQuery(reportFilter)
		
		const {  resource_id } = reportFilter
		
		
		const reports = await this.reportModel.find(filter, null, options).lean();

		const activity_term_list = [...new Set(reports.map(report => report.activity_term))]

		const terms_list = await this.termsService.get_terms(activity_term_list, resource_id);

		const reports_with_terms = reports.map((report) => {
			report['term'] = terms_list.find(term => term.activity_term == report.activity_term)
			return report;
		})
		const reports_count = await this.reportModel.count(filter);

		return {
			data: reports_with_terms,
			count: reports_count
		}
	}

	async get_user_reports(
		orcid_id: string,
		resource_id: string,
		page = 1,
		page_size = 10,
	) {
		const resource_uri = await this.partnerResourceService.retrieve_uri(
			resource_id,
		);

		const skip = (page - 1) * page_size;
		const reports_promise = this.reportModel
			.find({ curator_orcid: orcid_id, resource_uri })
			.sort({ timestamp: -1 })
			.skip(skip)
			.limit(page_size)
			.lean();

		const reports_count_promise = this.reportModel.count({
			curator_orcid: orcid_id,
			resource_uri,
		});
		const [reports, reports_count] = await Promise.all([
			reports_promise,
			reports_count_promise,
		]);
		// the string constructor is used to convert from? mongoose string type to regular typescript string (I know, it's just nonesense)
		const report_terms = reports.map((report) => String(report.activity_term));

		const terms = await this.termsService.get_terms(report_terms, resource_id);
		const user_reports = reports.map((report) => {
			return {
				...report,
				term: terms.find(
					(term) => term.activity_term == String(report.activity_term),
				),
			};
		});

		return {
			data: user_reports,
			count: reports_count,
		};
	}

	private validate_sort_fields(sort_field) {
		if (['asc', 'desc'].includes(sort_field)) {
			return sort_field === 'asc' ? 1 : -1;
		} else {
			return null;
		}
	}

	async all_reports_count() {
		return await this.reportModel.count();
	}


	async delete_all_resource_reports(resource_id: string) {
		const resource_uri = await this.partnerResourceService.retrieve_uri(resource_id);

		return await this.reportModel.deleteMany({
			'$or': [
				{ resource_uri },
				{ resource_id }
			]
		})

	}

}

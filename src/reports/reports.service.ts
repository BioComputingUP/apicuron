import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../auth/users/user.schema';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { TermsService } from '../resources/terms/terms.service';
import { ReportDto } from './dto/report.dto';
import { Report, ReportDocument } from './reports.schema';

@Injectable()
export class ReportsService {
	constructor(
		@InjectModel(Report.name) private reportModel: Model<ReportDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		protected partnerResourceService: PartnerResourcesService,
		protected termsService: TermsService,
	) {}

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

	async get_reports({
		sort_field = '',
		sort_value = '',
		resource_id = '',
		curator_orcid = '',
	}) {
		let aggregation_pipeline = [];

		// orcid and resource_id filtering
		// by building the $match aggregation object

		if (!!curator_orcid || !!resource_id) {
			let match_obj = {
				$match: {},
			};
			match_obj.$match['resource_id'] = !!resource_id ? resource_id : undefined;
			match_obj.$match['curator_orcid'] = !!curator_orcid
				? curator_orcid
				: undefined;
			aggregation_pipeline.push(match_obj);
		}

		// Sorting and sort fields
		const sort = this.validate_sort_fields(sort_value);

		if (!!sort_field && this.sort_fields.includes(sort_field) && !!sort) {
			let sort_obj = {
				$sort: {},
			};
			sort_obj.$sort[sort_field] = sort;
			aggregation_pipeline.push(sort_obj);
		}

		aggregation_pipeline = aggregation_pipeline.concat([
			{
				$limit: this.page_size,
			},
			{
				$lookup: {
					from: 'terms_def',
					localField: 'activity_term',
					foreignField: 'activity_term',
					as: 'term',
				},
			},
			{
				$unwind: {
					path: '$term',
				},
			},
			{
				$project: {
					_id: -1,
					curator_orcid: 1,
					resource_uri: 1,
					entity_uri: 1,
					activity_term: 1,
					timestamp: 1,
					activity_name: '$term.activity_name',
					score: '$term.score',
					description: '$term.description',
					activity_category: '$term.activity_category',
				},
			},
		]);
		return await this.reportModel.aggregate(aggregation_pipeline);
		// return await this.reportModel
		// 	.find(null, null, {
		// 		limit: page_size,
		// 	}).populate('term').exec()
	}

	async get_user_statistics() {
		const userCursor = await this.userModel
			.find(
				{},
				{
					curator_orcid: 1,
					family_name: 1,
					given_name: 1,
				},
			)
			.cursor();

		for await (const doc of userCursor) {
			const reports = this.reportModel.aggregate([
				{
					$match: {
						curator_orcid: doc['curator_orcid'],
					},
				},
				{
					$lookup: {
						from: 'terms_def',
						localField: 'activity_term',
						foreignField: 'activity_term',
						as: 'term',
					},
				},
				{
					$unwind: {
						path: '$term',
					},
				},
			]);
		}
	}

	async getReports(
		orcid_id: string,
		resource_id: string,
		page_size = 10,
		page = 1,
	) {
		const skip = (page - 1) * page_size;
		let query_obj = {};

		if (!!resource_id) {
			const resource_uri = await this.partnerResourceService.retrieve_uri(
				resource_id,
			);
			if (!!resource_uri) {
				query_obj['resource_uri'] = resource_uri;
			}
		}

		if (!!orcid_id) {
			query_obj['curator_orcid'] = orcid_id;
		}
		return await this.reportModel.find(query_obj).skip(skip).limit(page_size);
	}

	async get_user_reports(
		orcid_id: string,
		resource_id: string,
		page = 1,
		page_size = 10,
	) {
		const resource_uri = await this.partnerResourceService.retrieve_uri(resource_id)

		const skip = (page - 1) * page_size;
		const reports_promise = this.reportModel
			.find({ curator_orcid: orcid_id, resource_uri })
			.sort({ timestamp: -1 })
			.skip(skip)
			.limit(page_size)
			.lean();
		
		const reports_count_promise = this.reportModel.count({ curator_orcid: orcid_id, resource_uri })
		const [ reports, reports_count ] = await Promise.all([reports_promise, reports_count_promise])
		// the string constructor is used to convert from mongoose string type to regular typescript string (I know, it's just nonesense)
		const report_terms = reports.map((report) => String(report.activity_term));


		const terms = await this.termsService.get_terms(report_terms, resource_uri);
		const user_reports = reports.map((report) => {
			return {
				...report,
				term: terms.find((term) => term.activity_term == String(report.activity_term)),
			};
		});

		return {
			data: user_reports,
			count: reports_count
		};
	}

	private validate_sort_fields(sort_field) {
		if (['asc', 'desc'].includes(sort_field)) {
			return sort_field === 'asc' ? 1 : -1;
		} else {
			return null;
		}
	}

	async count() {
		return await this.reportModel.count();
	}
}

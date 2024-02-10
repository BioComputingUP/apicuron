import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { Model } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { PartnerResource, PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';

@Injectable()
export class ReportServiceOnStartup implements OnApplicationBootstrap {
	constructor(
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
	) {}
	logger = new Logger(ReportServiceOnStartup.name);

	async onApplicationBootstrap() {
		// await this.fixMissingResourceIds();
		// await this.assignPrivacyFields();
	}

	// async assignPrivacyFields() {
	// 	const dataCache = new Map<string, ActivityTypeDocument>();
	// 	let updateCount = 0;
	// 	let cacheHit = 0;
	// 	let cacheMiss = 0;
	// 	const reports$ = this.reportModel.find({
	// 		activityClass: { $exists: false },
	// 	});
	// 	for await (const report of reports$) {
	// 		try {
	// 			if (dataCache.has(report.curator_orcid)) {
	// 				cacheHit += 1;
	// 				report.activityClass = dataCache.get(
	// 					report.curator_orcid,
	// 				) as ActivityTypeDocument;
	// 			} else {
	// 				cacheMiss += 1;
	// 				const activityClass = new ActivityType({
	// 					privacy:
	// 						(await this.userModel.findOne({ orcid_id: report.curator_orcid }))
	// 							?.privacy ?? PrivacyType.private,
	// 					contribution_type: ContributionType.community,
	// 				});
	// 				report.activityClass = activityClass as ActivityTypeDocument;

	// 				dataCache.set(
	// 					report.curator_orcid,
	// 					report.activityClass as ActivityTypeDocument,
	// 				);
	// 			}

	// 			updateCount += 1;
	// 			await report.save();
	// 		} catch (err: any) {
	// 			this.logger.error(err.message, err.stack, err.name);
	// 			throw new Error('Erorr occured while initializing the privacy Fields');
	// 		}
	// 	}
	// 	const cacheHitRate =
	// 		updateCount > 0 ? cacheHit / (cacheMiss + cacheHit) : 0;
	// 	this.logger.log(
	// 		`Updated ${updateCount} reports privacy fields. Cache size: ${dataCache.size} With cache Hit Rate: ${cacheHitRate} `,
	// 	);
	// }

	// async fixMissingResourceIds() {
	// 	const reports$ = this.reportModel.find({
	// 		resource_id: { $exists: false },
	// 	});

	// 	const savePromises$ = [];
	// 	const dataCache = new Map<string, string>();
	// 	let updateCount = 0;
	// 	let cacheHit = 0;
	// 	let cacheMiss = 0;

	// 	for await (const report of reports$) {
	// 		if (report.resource_uri) {
	// 			if (dataCache.has(report.resource_uri)) {
	// 				cacheHit += 1;
	// 				report.resource_id = dataCache.get(report.resource_uri);
	// 			} else {
	// 				cacheMiss += 1;
	// 				const resource = await this.resourceModel.findOne({
	// 					resource_uri: report.resource_uri,
	// 				});
	// 				dataCache.set(report.resource_uri, resource.resource_id);
	// 				report.resource_id = resource.resource_id;
	// 			}

	// 			updateCount += 1;
	// 			const savePromise$ = report.save();
	// 			savePromises$.push(savePromise$);
	// 		} else {
	// 			this.logger.warn(
	// 				`Found report from ${report.curator_orcid} with no resource_id or resource_uri`,
	// 			);
	// 		}
	// 	}

	// 	await Promise.all(savePromises$);

	// 	const cacheHitRate =
	// 		updateCount > 0 ? cacheHit / (cacheMiss + cacheHit) : 0;

	// 	this.logger.log(
	// 		`Fixed ${updateCount} reports with missing resource_id field with Cache hit rate ${cacheHitRate}`,
	// 	);
	// }
}

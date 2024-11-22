import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LeanDocument, Model, SortOrder } from 'mongoose';
import { UpdateResult } from 'mongodb';
import { ResourceStatsDocument } from '../../core/schemas/resource/resource-stats.schema';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
@Injectable()
export class ComputeResourceStatsService {
	constructor(
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
	) {}

	logger = new Logger(ComputeResourceStatsService.name);
	bufferThreshold = 50 as const;

	async getFirstOrLastSubmissionDate(
		resource_id: string,
		firstOrLast: 'first' | 'last',
	): Promise<Date | null> {
		const order = firstOrLast === 'first' ? 1 : -1;
		const report = await this.reportModel
			.find({ resource_id }, { timestamp: 1 })
			.sort({ timestamp: order }) // sort by timestamp according to th
			.limit(1);
		return report[0]?.timestamp ?? null;
	}

	async getContributionCount(resource_id: string): Promise<number> {
		return await this.reportModel.countDocuments({
			resource_id,
		});
	}

	async getUniqueContributorsCount(resource_id: string): Promise<number> {
		const r = await this.reportModel.aggregate([
			{ $match: { resource_id } },
			{ $group: { _id: '$curator_orcid' } },
			{ $count: 'unique_contributors' },
		]);

		return r[0]?.unique_contributors ?? 0;
	}

	private async getContributionCountFromDate(
		resource_id: string,
		date: Date,
	): Promise<number> {
		return await this.reportModel.countDocuments({
			resource_id,
			timestamp: { $gte: date },
		});
	}
	async computeResourceStats(
		resource: PartnerResourceDocument,
	): Promise<UpdateResult>;
	async computeResourceStats(resource_id: string): Promise<UpdateResult>;
	async computeResourceStats(
		resource: string | PartnerResourceDocument,
	): Promise<UpdateResult> {
		const resource_id =
			typeof resource === 'string' ? resource : resource.resource_id;

		const [
			firstSubmissionDate,
			lastSubmissionDate,
			contributionCount,
			uniqueContributors,
		] = await Promise.all([
			this.getFirstOrLastSubmissionDate(resource_id, 'first'),
			this.getFirstOrLastSubmissionDate(resource_id, 'last'),
			this.getContributionCount(resource_id),
			this.getUniqueContributorsCount(resource_id),
		]);

		const stats: LeanDocument<ResourceStatsDocument> = {
			_id: undefined,
			resource_id,
			firstContributionDate: firstSubmissionDate,
			lastContributionDate: lastSubmissionDate,
			contributionCount: contributionCount,
			uniqueContributors: uniqueContributors,
		};

		const update = await this.setResourceStats(stats);
		this.logger.log(`Updated stats for resource ${resource_id}`);
		return update;
	}

	async setResourceStats(
		resourceStat: ResourceStatsDocument | LeanDocument<ResourceStatsDocument>,
	): Promise<UpdateResult> {
		const t = await this.resourceModel.updateOne(
			{ resource_id: resourceStat.resource_id },
			{ $set: { stats: resourceStat } },
		);
		return t;
	}

	async reportIsLast(report: ReportDocument): Promise<boolean> {
		const count = await this.reportModel.exists({
			timestamp: { $gt: report.timestamp },
			resource_id: report.resource_id,
		});
		return !count;
	}

	async computeAllResourceStats() {
		const resources = this.resourceModel
			.find({}, null, { batchSize: 10 })
			.cursor();

		let updates$: Promise<any>[] = [];
		for await (const resource of resources) {
			const statUpdate$ = this.computeResourceStats(resource);
			updates$.push(statUpdate$);

			if (updates$.length > this.bufferThreshold) {
				await Promise.all(updates$);
				updates$ = [];
			}
		}

		await Promise.all(updates$);
	}
}

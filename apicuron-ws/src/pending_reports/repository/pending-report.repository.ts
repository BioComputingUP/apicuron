import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PendingReport } from '../entities/pending-report.entity';
import {
	PendingReportDB,
	PendingReportDocument,
} from 'src/core/schemas/pending reports/pending-report.schema';
import { ContributorIdentifierType, PendingReportStatus } from 'src/core/enums';

@Injectable()
export class PendingReportsRepository {
	constructor(
		@InjectModel(PendingReportDB.name)
		private readonly model: Model<PendingReportDocument>,
	) {}

	async save(report: PendingReport): Promise<void> {
		await this.model.create({
			resource_id: report.resource_id,
			entity_uri: report.entity_uri,
			activity_term: report.activity_term,
			timestamp: report.timestamp,
			contributor_identifier: report.contributor_identifier,
			contributor_identifier_type: report.contributor_identifier_type,
		});
	}

	async findAll(): Promise<PendingReport[]> {
		const docs = await this.model.find().exec();
		return docs.map(PendingReport.fromMongooseDocument);
	}

	async findByResourceId(resourceId: string): Promise<PendingReport[]> {
		const docs = await this.model.find({ resource_id: resourceId }).exec();
		return docs.map(PendingReport.fromMongooseDocument);
	}
	async findPendingByContributorIdentifier(
		contributorIdentifier: string,
		contributorIdentifierType: ContributorIdentifierType,
	): Promise<PendingReport[]> {
		const docs = await this.model
			.find({
				contributor_identifier: contributorIdentifier,
				contributor_identifier_type: contributorIdentifierType,
				status: PendingReportStatus.PENDING,
			})
			.exec();
		return docs.map(PendingReport.fromMongooseDocument);
	}

	async archive(report_id: string): Promise<void> {
		await this.model.findByIdAndUpdate(report_id, {
			status: PendingReportStatus.SUBMITTED,
			reconciled_at: new Date(),
		});
	}
	async markAsFailed(report_id: string, error: unknown): Promise<void> {
		await this.model.findByIdAndUpdate(report_id, {
			status: PendingReportStatus.FAILED,
			error:
				error instanceof Error
					? JSON.stringify(error, Object.getOwnPropertyNames(error))
					: JSON.stringify(error),
			$inc: { reconciliation_attempt_count: 1 },
		});
	}
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PendingReport } from '../entities/pending-report.entity';
import {
	PendingReportDB,
	PendingReportDocument,
} from 'src/core/schemas/pending reports/pending-report.schema';

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
}

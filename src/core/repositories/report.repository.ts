import { Model } from 'mongoose';
import { Report, ReportDocument } from '../schemas/reports.schema';
import { EntityRepository } from './abstract-repository';
import { InjectModel } from '@nestjs/mongoose';

export class ReportRepository extends EntityRepository<ReportDocument> {
	constructor(@InjectModel(Report.name) ReportModel: Model<ReportDocument>) {
		super(ReportModel);
	}
}

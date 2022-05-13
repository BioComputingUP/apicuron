import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportDto } from './dto/report.dto';
import { Report, ReportDocument } from './reports.schema';

@Injectable()
export class ReportsService {
	constructor(
		@InjectModel(Report.name) private reportModel: Model<ReportDocument>,
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
}

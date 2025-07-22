import { faker } from '@faker-js/faker';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { AppModule } from '../app.module';
import {
	PartnerResource,
	PartnerResourceDocument,
	PartnerResourceModel,
	Term,
	TermModel,
} from '../core/schemas';
import { ReportModel, Report } from '../core/schemas/reports.schema';
import { User, UserModel } from '../core/schemas/user.schema';
import {
	SubmitReportDto,
	SubmitReportsDto,
} from '../submit-reports/dto/submit-report.dto';
import { SubmitReportService } from '../submit-reports/services/submit-reports.service';
import { mockReport } from './seed';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	// initialize models
	const reportModel: ReportModel = app.get(getModelToken(Report.name));
	const userModel: UserModel = app.get(getModelToken(User.name));
	const resourceModel: PartnerResourceModel = app.get(
		getModelToken(PartnerResource.name),
	);

	const termModel: TermModel = app.get(getModelToken(Term.name));

	const userCount = await userModel.countDocuments();

	const resources = await resourceModel.find();
	const orcidIds = new Set();

	const processResource = async (resource: PartnerResourceDocument) => {
		const terms = (
			await termModel.find({ resource_id: resource.resource_id })
		).map((term) => term.activity_term);

		if (terms.length === 0) {
			return;
		}
		const reports: SubmitReportDto[] = [];
		const reportCount = faker.number.int({ min: 100, max: 150 });
		for (let index = 0; index < reportCount; index++) {
			const report = await mockReport(
				userModel,
				reportModel,
				resource,
				userCount,
				terms,
			);
			orcidIds.add(report.curator_orcid);
			reports.push(report);
		}

		await app
			.get(SubmitReportService)
			.insertReports(plainToInstance(SubmitReportsDto, { reports }), {
				preventEvents: false,
			});
	};
	const computations$: Promise<void>[] = [];
	for (const resource of resources) {
		const resourceProcess$ = processResource(resource);
		computations$.push(resourceProcess$);
	}

	await Promise.all(computations$);

	console.log(`Created reports for ${orcidIds.size} unique ORCID IDs`);
	await app.close();
}

if (require.main === module) {
	console.log('called directly');
	bootstrap();
}

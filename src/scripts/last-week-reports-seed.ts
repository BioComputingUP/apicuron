import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../core/schemas/resource/partner-resource.schema';
import { Term } from '../core/schemas/terms.schema';
import { faker } from '@faker-js/faker';
import { PrivacyType } from '../core/enums';
import { Report } from '../core/schemas/reports.schema';
import { ReportsService } from '../reports/reports.service';
import { SubmitReportService } from '../submit-reports/services/submit-reports.service';

async function mockReport(
	reportModel: Model<Report>,
	resource: PartnerResourceDocument,
	terms: string[],
) {
	const testingOrcidId = '0000-0002-2472-5685';

	return {
		activity_term: faker.helpers.arrayElement(terms),

		curator_orcid: testingOrcidId,

		entity_uri: faker.internet.url(),

		resource_uri: resource.resource_uri,

		resource_id: resource.resource_id,

		timestamp: faker.date.recent({ days: 7 }),
		privacy: faker.helpers.arrayElement([
			PrivacyType.private,
			PrivacyType.public,
		]),
		league: faker.helpers.arrayElement(resource.leagues.map((l) => l.name)),
	};
}

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	// initialize models
	const reportModel: Model<Report> = app.get(getModelToken(Report.name));
	const reportService = app.get(SubmitReportService);
	const resourceModel: Model<PartnerResource> = app.get(
		getModelToken(PartnerResource.name),
	);

	const termModel: Model<Term> = app.get(getModelToken(Term.name));

	// initialize variables
	const reportCount = 1;
	// const termCount = 30;

	const terms = await termModel.find({ resource_id: 'disprot' });
	const activities = terms.map((terms) => terms.activity_term);

	const resource = await resourceModel.findOne({ resource_id: 'disprot' });

	const reportSaves$ = [];
	for (let index = 0; index < reportCount; index++) {
		const report = await mockReport(reportModel, resource, activities);
		reportSaves$.push(reportService.insertReport(report));
	}

	await Promise.all(reportSaves$);

	await app.close();
}

bootstrap();

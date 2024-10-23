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
import {
	LeanReportDocument,
	Report,
	ReportDocument,
} from '../core/schemas/reports.schema';
import { SubmitReportService } from '../submit-reports/services/submit-reports.service';
import { OrcidClientService } from '../orcid/orcid-client/orcid-client.service';
import { UsersService } from '../auth/users/services/users.service';
import { Logger } from '@nestjs/common';
import * as moment from 'moment-timezone';

async function mockReport(
	reportModel: Model<Report>,
	resource: PartnerResourceDocument,
	terms: string[],
	orcidIds: string[],
) {
	return {
		league: 'default',
		activity_term: faker.helpers.arrayElement(terms),

		curator_orcid: faker.helpers.arrayElement(orcidIds),

		entity_uri: faker.internet.url(),

		resource_uri: resource.resource_uri,

		resource_id: resource.resource_id,

		timestamp: faker.date.between({
			from: moment().utc().startOf('week').toDate(),
			to: new Date(),
		}),
		privacy: faker.helpers.arrayElement([
			PrivacyType.private,
			PrivacyType.public,
		]),
	};
}

function createUser(input: any) {
	const result = {} as any;
	result.orcid_id = input['orcid-id'];
	result.given_names = input['given-names'] ?? '';
	result.family_names = input['family-names'] ?? '';
	result.credit_name = input['credit-name'] ?? null;

	result.displayedName =
		result.credit_name ?? `${result.given_names} ${result.family_names}`;

	result.profileUrl = `https://sandbox.orcid.org/${result.orcid_id}`;

	result.privacy = PrivacyType.public as PrivacyType;

	return result;
}

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const testingOrcidId = '0000-0002-2472-5685';
	// initialize models
	const reportModel: Model<Report> = app.get(getModelToken(Report.name));
	const reportService = app.get(SubmitReportService);
	const resourceModel: Model<PartnerResource> = app.get(
		getModelToken(PartnerResource.name),
	);

	// Load users

	const query = 'test';
	const searchResults = await app
		.get(OrcidClientService)
		.expandedSearch(`given-and-family-names:${query} OR credit-name:${query}`);

	const entries = searchResults.data?.['expanded-result'] as any[];

	const users = entries.map((entry) => createUser(entry));

	const orcidIds = users.map((user) => user.orcid_id);

	for (const user of users) {
		await app.get(UsersService).createOrUpdateUser(user);
	}
	const logger = new Logger('Seed Script Logger');

	const termModel: Model<Term> = app.get(getModelToken(Term.name));

	const reportCount = parseInt(process.argv?.[2] ?? '150');

	logger.verbose(`Generating ${reportCount} reports`);
	const resource = await resourceModel.findOne();

	const terms = await termModel.find({
		resource_id: resource.resource_id,
		league: 'default',
	});
	const activities = terms.map((terms) => terms.activity_term);

	const insertReport = async (reportDoc: LeanReportDocument) => {
		try {
			const { report, callback } = await reportService.insertReport(reportDoc);
			await callback();
		} catch (err) {
			logger.error(`Error inserting report: ${err.message}`);
		}
	};

	const reportSaves$ = [];
	for (let index = 0; index < reportCount; index++) {
		const report = await mockReport(
			reportModel,
			resource,
			activities,
			orcidIds,
		);
		const rep = new reportModel(report);
		logger.debug(
			`Inserting report with date ${report.timestamp.toDateString()} for resource ${
				report.resource_id
			}`,
		);
		await insertReport(rep.toObject());
	}

	await Promise.all(reportSaves$);

	// const result$ = await app
	// 	.get(EventEmitter2)
	// 	.emitAsync(
	// 		BulkSubmissionEvent.name,
	// 		new BulkSubmissionEvent(testingOrcidId, [resource.resource_id]),
	// 	);
	// logger.log(`Bulk submission event emitted: ${result$.length} listeners`);

	await app.close();
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../core/schemas/resource/partner-resource.schema';
import { Term } from '../core/schemas/terms.schema';
import { en, faker } from '@faker-js/faker';
import { PrivacyType } from '../core/enums';
import { Report } from '../core/schemas/reports.schema';
import { SubmitReportService } from '../submit-reports/services/submit-reports.service';
import { OrcidClientService } from '../orcid/orcid-client/orcid-client.service';
import { UsersService } from '../auth/users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BulkSubmissionEvent } from '../submit-reports/events/events';
import { Logger } from '@nestjs/common';

async function mockReport(
	reportModel: Model<Report>,
	resource: PartnerResourceDocument,
	terms: string[],
	orcidIds: string[],
) {
	return {
		activity_term: faker.helpers.arrayElement(terms),

		curator_orcid: faker.helpers.arrayElement(orcidIds),

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

	const terms = await termModel.find({ resource_id: resource.resource_id });
	const activities = terms.map((terms) => terms.activity_term);


	const reportSaves$ = [];
	for (let index = 0; index < reportCount; index++) {
		const report = await mockReport(
			reportModel,
			resource,
			activities,
			orcidIds,
		);
		reportSaves$.push(
			reportService.insertReport(report, { preventEvents: true }),
		);
	}

	await Promise.all(reportSaves$);

	await app
		.get(EventEmitter2)
		.emitAsync(
			BulkSubmissionEvent.name,
			new BulkSubmissionEvent(testingOrcidId, [resource.resource_id]),
		);

	await app.close();
}

bootstrap();

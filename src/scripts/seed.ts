import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module';
import { Report } from '../core/schemas/reports.schema';
import { faker } from '@faker-js/faker';
import { Term } from '../core/schemas/terms.schema';
import { Model } from 'mongoose';
import { User } from '../core/schemas/user.schema';
import { random, sum } from 'lodash';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../core/schemas/resource/partner-resource.schema';
import { PrivacyType } from '../core/enums';
import { Logger } from '@nestjs/common';
import { UsersService } from '../auth/users/services/users.service';
import { SubmitReportService } from '../submit-reports/services/submit-reports.service';
import { plainToInstance } from 'class-transformer';
import { SubmitReportsDto } from '../submit-reports/dto/submit-report.dto';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const logger = new Logger('SeederLogger');

	// initialize models
	const reportModel: Model<Report> = app.get(getModelToken(Report.name));
	const userModel: Model<User> = app.get(getModelToken(User.name));
	const resourceModel: Model<PartnerResource> = app.get(
		getModelToken(PartnerResource.name),
	);

	const userService = app.get(UsersService);

	const termModel: Model<Term> = app.get(getModelToken(Term.name));

	// check if the database is empty, if it is we start seeding,
	// otherwise we stop the seed
	const entityCounts: number[] = await Promise.all([
		userModel.count(),
		resourceModel.count(),
		reportModel.count(),
		termModel.count(),
	]);

	if (sum(entityCounts) > 0) {
		logger.error(
			'Found documents in the database, aborting seed...Closing app',
		);
		await app.close();
		return;
	}

	// initialize variables
	const reportCount = 50;
	const termCount = 30;
	const testingOrcidId = '0000-0002-2472-5685';

	// create mock user
	await userService.createUser({
		orcid_id: testingOrcidId,
	});

	const exampleResource = new resourceModel({
		resource_description: faker.lorem.sentences(2),
		resource_name: 'Testing Resource',
		resource_id: 'example_resource',
		resource_uri: faker.internet.url(),
		resource_url: faker.internet.url(),
		joined_date: faker.date.recent({ days: 10 })
	});

	await exampleResource.save();

	logger.verbose(`Created testing resource successfully`);

	await userModel.updateOne(
		{ orcid_id: testingOrcidId },
		{
			$push: {
				resources: {
					resource_id: exampleResource.resource_id,
					name: exampleResource.resource_name,
				},
			},
		},
	);

	logger.verbose(
		`Assigned testing resource to testing user: ${testingOrcidId}`,
	);

	//create terms for resource
	const terms$ = [];

	for (let i = 0; i < termCount; i++) {
		const termName = faker.lorem.words({ min: 1, max: 3 });
		const term = new termModel({
			resource_id: exampleResource.resource_id,
			activity_term: faker.helpers.slugify(termName),
			activity_name: termName,
			activity_category: faker.helpers.arrayElement([
				'generation',
				'invalidation',
				'revision',
			]),
			description: faker.lorem.sentence({ min: 3, max: 6 }),
			league: exampleResource.defaultLeague,
			privacy: faker.helpers.arrayElement([
				PrivacyType.private,
				PrivacyType.public,
			]),
			score: faker.number.int({ max: 100, min: 5 }),
		});

		terms$.push(term.save());
	}

	await Promise.all(terms$);

	logger.verbose(`Created ${termCount} Mock terms Successfully`);

	// create reports for test user

	// get example resource terms
	const terms: string[] = (
		await termModel.find({ resource_id: exampleResource.resource_id })
	).map((term: Term) => term.activity_term);

	const userCount: number = await userModel.count();

	const reports = [];

	for (let index = 0; index < reportCount; index++) {
		const report = await mockReport(
			userModel,
			reportModel,
			exampleResource,
			userCount,
			terms,
		);

		reports.push(report);
	}

	await app
		.get(SubmitReportService)
		.insertReports(plainToInstance(SubmitReportsDto, { reports }));

	// await Promise.all(savesPromise);

	logger.verbose(`Created ${reportCount} Mock reports`);

	// await app
	// 	.get(EventEmitter2)
	// 	.emitAsync(
	// 		BulkSubmissionEvent.name,
	// 		new BulkSubmissionEvent(testingOrcidId, [exampleResource.resource_id]),
	// 	);

	await app.close();
}

export async function mockReport(
	userModel: Model<User>,
	reportModel: Model<Report>,
	resource: PartnerResourceDocument,
	userCount = 1,
	terms: string[],
) {
	const randomUser = await userModel.findOne(
		{},
		{},
		{ skip: random(0, userCount - 1, false) },
	);

	const report = {
		activity_term: faker.helpers.arrayElement(terms),

		curator_orcid: randomUser.orcid_id,

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

	return report;
}

if (require.main === module) {
	console.log('called directly');
	bootstrap();
}

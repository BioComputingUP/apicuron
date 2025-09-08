import { faker } from '@faker-js/faker';
import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { map } from 'lodash';
import { Connection, Model } from 'mongoose';
import { SubmittedResourcesService } from 'src/resources/submitted-resources/resources.service';
import { FileUploadDto } from 'src/util/file-upload.helper';
import { assertIsDefined } from 'src/util/type-assertion.helper';
import { AppModule } from '../app.module';
import { UsersService } from '../auth/users/services/users.service';
import { PrivacyType } from '../core/enums';
import { Report, ReportModel } from '../core/schemas/reports.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
	PartnerResourceModel,
} from '../core/schemas/resource/partner-resource.schema';
import { Term, TermDocument } from '../core/schemas/terms.schema';
import { User, UserModel } from '../core/schemas/user.schema';
import {
	SubmitReportDto,
	SubmitReportsDto,
} from '../submit-reports/dto/submit-report.dto';
import { SubmitReportService } from '../submit-reports/services/submit-reports.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	await (app.get(getConnectionToken()) as Connection).db.dropDatabase();

	const logger = new Logger('SeederLogger');

	// initialize models
	const reportModel: ReportModel = app.get(getModelToken(Report.name));
	const userModel: UserModel = app.get(getModelToken(User.name));
	const resourceModel: PartnerResourceModel = app.get(
		getModelToken(PartnerResource.name),
	);
	const resourceService: SubmittedResourcesService = app.get(
		SubmittedResourcesService,
	);
	const http: HttpService = app.get(HttpService);

	const userService = app.get(UsersService);

	const termModel: Model<Term> = app.get(getModelToken(Term.name));

	// initialize variables
	const reportCount = 50;
	const termCount = 10;
	const testingOrcidId = '0000-0002-2472-5685';

	// create mock user
	// TODO: Fix !
	// await userService.createUser({
	// 	orcid_id: testingOrcidId,
	// 	privacy: PrivacyType.public,
	// });

	const tempResource = await resourceService.create_resource(
		{
			resource_description: faker.lorem.sentences(2),
			resource_name: 'Testing Resource',
			resource_long_name: 'Testing Resource Long Name',
			color: '#000000',
			resource_id: 'example_resource',
			resource_uri: faker.internet.url(),
			resource_url: faker.internet.url(),
		},
		testingOrcidId,
		await FileUploadDto.fromPicsum('https://picsum.photos/300/200.jpg', http),
	);

	await resourceService.make_partner(tempResource.resource_id);

	const exampleResource = await resourceModel.findOne({
		resource_id: tempResource.resource_id,
	});
	assertIsDefined(
		exampleResource,
		`Example resource with ID ${tempResource.resource_id} not found`,
	);

	logger.verbose(`Created testing resource successfully`);

	const secondResourceTemp = await resourceService.create_resource(
		{
			resource_description: faker.lorem.sentences(2),
			resource_name: 'Second Resource',
			resource_long_name: 'Second Resource Long Name',
			color: '#000000',
			resource_id: 'second_resource',
			resource_uri: faker.internet.url(),
			resource_url: faker.internet.url(),
		},
		testingOrcidId,
		await FileUploadDto.fromPicsum('https://picsum.photos/300/200.jpg', http),
	);

	await resourceService.make_partner(secondResourceTemp.resource_id);
	const secondResource = await resourceModel.findOne({
		resource_id: secondResourceTemp.resource_id,
	});
	assertIsDefined(
		secondResource,
		`Second resource with ID ${secondResourceTemp.resource_id} not found`,
	);
	logger.verbose(
		`Created second resource successfully logo: ${secondResource.logo}`,
	);

	logger.verbose(
		`Assigned testing resources to testing user: ${testingOrcidId}`,
	);

	// // Assign resources to test user
	// userModel.updateOne(
	// 	{ orcid_id: testingOrcidId },
	// 	{
	// 		$set: {
	// 			resources: [
	// 				{
	// 					resource_id: exampleResource.resource_id,
	// 				},
	// 				{
	// 					resource_id: secondResource.resource_id,
	// 				},
	// 			],
	// 		},
	// 	},
	// );

	//create terms for resource
	const terms$: Promise<TermDocument>[] = [];

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
			privacy: PrivacyType.public,
			score: faker.number.int({ max: 100, min: 5 }),
		});

		terms$.push(term.save());
	}
	await Promise.all(terms$);

	logger.verbose(`Created ${termCount} Mock terms Successfully`);
	// create terms for second resource
	const secondResourceTerms$: Promise<TermDocument>[] = [];

	for (let i = 0; i < termCount; i++) {
		const termName = faker.lorem.words({ min: 1, max: 3 });
		const term = new termModel({
			resource_id: secondResource.resource_id,
			activity_term: faker.helpers.slugify(termName),
			activity_name: termName,
			activity_category: faker.helpers.arrayElement([
				'generation',
				'invalidation',
				'revision',
			]),
			description: faker.lorem.sentence({ min: 3, max: 6 }),
			league: secondResource.defaultLeague,
			privacy: PrivacyType.public,
			score: faker.number.int({ max: 100, min: 5 }),
		});

		secondResourceTerms$.push(term.save());
	}

	await Promise.all(secondResourceTerms$);

	logger.verbose(
		`Created ${termCount} Mock terms for second resource Successfully`,
	);

	// create reports for test user
	// get example resource terms
	const exampleResourceTerms: string[] = (
		await termModel.find({ resource_id: exampleResource.resource_id })
	).map((term: Term) => term.activity_term);

	const secondResourceTerms: string[] = (
		await termModel.find({ resource_id: secondResource.resource_id })
	).map((term: Term) => term.activity_term);

	const userCount: number = await userModel.count();

	const reports: unknown[] = [];

	for (let index = 0; index < reportCount; index++) {
		const resource = index % 2 === 0 ? exampleResource : secondResource;
		const terms = index % 2 === 0 ? exampleResourceTerms : secondResourceTerms;

		const report = await mockReport(
			userModel,
			reportModel,
			resource,
			userCount,
			terms,
		);

		reports.push(report);
	}

	await app
		.get(SubmitReportService)
		.insertReports(plainToInstance(SubmitReportsDto, { reports }), {
			preventEvents: false,
		});

	logger.verbose(`Created ${reportCount} Mock reports`);

	// await app
	// 	.get(EventEmitter2)
	// 	.emitAsync(
	// 		BulkSubmissionEvent.name,
	// 		new BulkSubmissionEvent(testingOrcidId, [exampleResource.resource_id]),
	// 	);

	await app.close();
}

const randomOrcidIds = map(new Array(30), () => {
	const randomOrcid = map(new Array(4), () =>
		('000' + Math.random() * 1000).slice(-4),
	).join('-');
	return randomOrcid;
});

export async function mockReport(
	userModel: Model<User>,
	reportModel: Model<Report>,
	resource: PartnerResourceDocument,
	userCount = 1,
	terms: string[],
): Promise<SubmitReportDto> {
	// const randomUser = await userModel.findOne(
	// 	{},
	// 	{},
	// 	{ skip: random(0, userCount - 1, false) },
	// );
	// const randomOrcid = faker.helpers.arrayElement(randomOrcidIds);

	const randomOrcid = '0000-0002-2472-5685'; // for testing purposes, TODO: remove this

	// if (!randomUser) {
	// 	throw new Error('No user found');
	// }
	const report = {
		activity_term: faker.helpers.arrayElement(terms),

		curator_orcid: randomOrcid,

		entity_uri: faker.internet.url(),

		resource_uri: resource.resource_uri,

		resource_id: resource.resource_id,

		timestamp: faker.date.recent({ days: 25 }),
		privacy: PrivacyType.public,
		league: faker.helpers.arrayElement(resource.leagues.map((l) => l.name)),
	};

	return report;
}

if (require.main === module) {
	console.log('called directly');
	bootstrap();
}

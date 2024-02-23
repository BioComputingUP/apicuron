import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../app.module';
import { Report } from '../core/schemas/reports.schema';
import { faker } from '@faker-js/faker';
import { Term } from '../core/schemas/terms.schema';
import { Model } from 'mongoose';
import { User } from '../core/schemas/user.schema';
import { random } from 'lodash';
async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const reportModel: Model<Report> = app.get(getModelToken(Report.name));
	const userModel: Model<User> = app.get(getModelToken(User.name));

	const termModel: Model<Term> = app.get(getModelToken(Term.name));

	const resource = 'ped';

	// get disprotTerms
	const terms: string[] = await (
		await termModel.find({ resource_id: resource })
	).map((term: Term) => term.activity_term);

	const userCount: number = await userModel.count();

	async function createReport() {
		const randomUser = await userModel.findOne(
			{},
			{},
			{ skip: random(0, userCount - 1, false) },
		);

		const report = new reportModel({
			activity_term: terms[random(0, terms.length - 1, false)],

			curator_orcid: '0000-0002-2472-5685',

			entity_uri: faker.internet.url(),

			resource_uri: faker.internet.url(),

			resource_id: resource,

			timestamp: faker.date.recent({ days: 30 }),
		});

		return report;
	}

	const savesPromise = [];

	for (let index = 0; index < 50; index++) {
		const report = await createReport();

		savesPromise.push(report.save());
	}

	await Promise.all(savesPromise);

	await app.close();
}

bootstrap();

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { UsersService } from '../auth/users/services/users.service';
import {
	PartnerResource,
	PartnerResourceDocument,
	Term,
} from '../core/schemas';
import { User } from '../core/schemas/user.schema';
import { mockReport } from './seed';
import { Report } from '../core/schemas/reports.schema';
import { faker } from '@faker-js/faker';
import { plainToInstance } from 'class-transformer';
import {
	SubmitReportDto,
	SubmitReportsDto,
} from '../submit-reports/dto/submit-report.dto';
import { SubmitReportService } from '../submit-reports/services/submit-reports.service';

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

	const userCount = await userModel.countDocuments();

	const resources = await resourceModel.find();

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
			reports.push(report);
		}

		await app
			.get(SubmitReportService)
			.insertReports(plainToInstance(SubmitReportsDto, { reports }));
	};
	const computations$ = [];
	for (const resource of resources) {
		const resourceProcess$ = processResource(resource);
		computations$.push(resourceProcess$);
	}

	await Promise.all(computations$);

	await app.close();
}

if (require.main === module) {
	console.log('called directly');
	bootstrap();
}

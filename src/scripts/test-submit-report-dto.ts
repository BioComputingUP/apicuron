import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SubmitReportDto } from '../submit-reports/dto/submit-report.dto';
import { useContainer, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { SubmitReportService } from 'src/submit-reports/services/submit-reports.service';
import { getModelToken } from '@nestjs/mongoose';
import { Report } from 'src/core/schemas/reports.schema';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	// class-validator setup
	useContainer(app.select(AppModule), { fallbackOnErrors: true });
	await app.init();

	const plain = {
		activity_term: 'dolorum',
		curator_orcid: '0000-0001-8457-4455',
		entity_uri: 'https://clever-tam-o-shanter.org/entity/12345',
		timestamp: '2022-01-14 15:35:31',
		resource_id: 'second_resource',
	};

	const dtoInstance = plainToClass(SubmitReportDto, plain);
	const submitReportService: SubmitReportService = app.get(SubmitReportService);

	const r = await validate(dtoInstance);

	try {
		await submitReportService.insertReport(dtoInstance, {
			preventEvents: false,
		});
	} catch (err) {
		console.error('Error inserting report:', err);
	}

	await app.get(getModelToken(Report.name)).deleteOne({
		resource_id: dtoInstance.resource_id,
		curator_orcid: dtoInstance.curator_orcid,
		activity_term: dtoInstance.activity_term,
	});
	await app.close();
}

bootstrap();

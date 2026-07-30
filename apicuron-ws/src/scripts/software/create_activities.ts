import { BadRequestException, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { PartnerResourcesService } from 'src/resources/partner-resources/services/partner-resources.service';
import { CreateTermDto } from 'src/terms/dto/createTerm.dto';
import { TermsService } from 'src/terms/terms.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const term_service = app.get(TermsService);
	const resourceService = app.get(PartnerResourcesService);
	const logger = new Logger('CreateActivitiesScript');

	const resource_to_create_for = 'apicuron';

	const resource = await resourceService.get_resource(resource_to_create_for);

	const terms: CreateTermDto[] = [
		{
			activity_category: 'generation',
			activity_name: 'Feature Developement',
			description: 'Activity for feature developement contribution',
			resource_id: resource_to_create_for,
			activity_term: 'development_activity',
			score: 10,
			league: 'default',
			resource_uri: resource.resource_uri,
		},
		{
			activity_category: 'generation',
			activity_name: 'Documentation',
			description: 'Activity for documentation contribution',
			resource_id: resource_to_create_for,
			activity_term: 'documentation_activity',
			score: 10,
			league: 'default',
			resource_uri: resource.resource_uri,
		},
		{
			activity_category: 'generation',
			activity_name: 'Bug Fix',
			description: 'Activity for bug fix contribution',
			resource_id: resource_to_create_for,
			activity_term: 'bug_fixing_activity',
			score: 10,
			league: 'default',
			resource_uri: resource.resource_uri,
		},
		{
			activity_category: 'generation',
			activity_term: 'testing_activity',
			activity_name: 'Testing',
			description: 'Activity for testing contribution',
			resource_id: resource_to_create_for,
			score: 10,
			league: 'default',
			resource_uri: resource.resource_uri,
		},
		{
			activity_category: 'generation',
			activity_term: 'generic_pr_activity',
			activity_name: 'General Contribution',
			description: 'Activity for general pull request contribution',
			score: 10,
			league: 'default',
			resource_uri: resource.resource_uri,
			resource_id: resource_to_create_for,
		},
		{
			activity_category: 'revision',
			activity_term: 'generic_review_activity',
			activity_name: 'Review',
			description: 'Activity for review contribution',
			resource_id: resource_to_create_for,
			score: 10,
			league: 'default',
			resource_uri: resource.resource_uri,
		},
	];
	for (const term of terms) {
		try {
			const result = await term_service.createTerm(term);
			logger.log(`Term ${result.activity_term} created`);
		} catch (err) {
			if (err.code === 11000 || err instanceof BadRequestException)
				logger.verbose(`Term ${term.activity_term} already exists, skipped`);
			else logger.error(`Failed to create term ${term.activity_term}`, err);
		}
	}
	await app.close();
}

void bootstrap();

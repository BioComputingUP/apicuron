import { BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { SourceSystem } from 'src/core/schemas/components/resource-source.schema';
import { PartnerResourcesService } from 'src/resources/partner-resources/services/partner-resources.service';
import { CreateTermDto } from 'src/terms/dto/createTerm.dto';
import { TermsService } from 'src/terms/terms.service';

const DEFAULT_TERMS: Array<
	Pick<
		CreateTermDto,
		'activity_term' | 'activity_name' | 'activity_category' | 'description'
	>
> = [
	{
		activity_term: 'change_shipped',
		activity_name: 'Change Shipped',
		activity_category: 'generation',
		description: 'Authored a merged pull request',
	},
	{
		activity_term: 'bug_fixing',
		activity_name: 'Bug Fixing',
		activity_category: 'generation',
		description: 'Authored a merged pull request fixing a bug',
	},
	{
		activity_term: 'feature_building',
		activity_name: 'Feature Building',
		activity_category: 'generation',
		description: 'Authored a merged pull request adding or improving a feature',
	},
	{
		activity_term: 'documentation_writing',
		activity_name: 'Documentation Writing',
		activity_category: 'generation',
		description: 'Authored a merged pull request improving documentation',
	},
	{
		activity_term: 'test_writing',
		activity_name: 'Test Writing',
		activity_category: 'generation',
		description: 'Authored a merged pull request adding or improving tests',
	},
	{
		activity_term: 'codebase_maintenance',
		activity_name: 'Codebase Maintenance',
		activity_category: 'generation',
		description:
			'Authored a merged pull request doing maintenance or refactoring',
	},
	{
		activity_term: 'change_reviewing',
		activity_name: 'Change Reviewing',
		activity_category: 'revision',
		description: "Reviewed someone else's merged pull request",
	},
	{
		activity_term: 'technical_discussion',
		activity_name: 'Technical Discussion',
		activity_category: 'revision',
		description:
			"Took part in the discussion of someone else's merged pull request",
	},
	{
		activity_term: 'change_integration',
		activity_name: 'Change Integration',
		activity_category: 'revision',
		description: "Merged someone else's pull request",
	},
];
async function bootstrap() {
	const logger = new Logger('LinkRepositoryScript');
	const [resource_id, repository_id, full_name] = process.argv.slice(2);
	if (
		!resource_id ||
		!repository_id ||
		!full_name ||
		!/^\d+$/.test(repository_id)
	) {
		logger.error(
			'Usage: node dist/scripts/software/link-repository.js <resource_id> <numeric_repository_id> <owner/name>',
		);
		process.exit(1);
	}

	const app = await NestFactory.createApplicationContext(AppModule);
	const resourceService = app.get(PartnerResourcesService);
	const termService = app.get(TermsService);

	try {
		const resource = await resourceService.get_resource(resource_id);

		try {
			const { linked } = await resourceService.linkSource(resource_id, {
				system: SourceSystem.GITHUB,
				repository_id,
				full_name,
			});
			logger.log(
				linked
					? `Linked ${full_name} (${repository_id}) to ${resource_id}`
					: `${full_name} already linked to ${resource_id}`,
			);
		} catch (err) {
			if (err instanceof ConflictException) {
				logger.error(err.message);
				return; // linked to another resource: do not create terms
			}
			throw err;
		}

		for (const term of DEFAULT_TERMS) {
			try {
				const result = await termService.createTerm({
					...term,
					resource_id,
					resource_uri: resource.resource_uri,
					score: 10,
					league: 'default',
				});
				logger.log(`Term ${result.activity_term} created`);
			} catch (err) {
				if (err.code === 11000 || err instanceof BadRequestException)
					logger.log(`Term ${term.activity_term} already exists, skipped`);
				else logger.error(`Failed to create term ${term.activity_term}`, err);
			}
		}
	} finally {
		await app.close();
	}
}

void bootstrap();

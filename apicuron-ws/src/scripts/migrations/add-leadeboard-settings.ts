import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { PartnerResourceRepository } from 'src/core/repositories/partner-resource.repository';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const logger = new Logger('AddLeaderboardSettings');
	logger.log('Bootstraping AddLeaderboardSettings...');

	const resourceRepo = app.get(PartnerResourceRepository);
	const columns = [
		'Ranking',
		'Contributor',
		'Generation Contributions',
		'Invalidation Contributions',
		'Revision Contributions',
		'Total Score',
		'last Contribution Date',
	];
	logger.log('Updating leaderboard settings...');
	try {
		const res = await resourceRepo.updateMany(
			{},
			{
				$set: {
					leaderboard_preferences: {
						monthly: columns,
						weekly: columns,
						total: [...columns, 'Medals', 'Badges'],
					},
				},
			},
		);
		logger.log(
			`Updated ${res.modifiedCount} resources with leaderboard settings.`,
		);
	} catch (err: unknown) {
		if (err instanceof Error) {
			logger.error(`Failed to update leaderboard settings: ${err.message}`);
		} else {
			logger.error(
				`Failed to update leaderboard settings: ${JSON.stringify(err)}`,
			);
		}
	} finally {
		await app.close();
	}
}
if (require.main === module) {
	bootstrap();
}

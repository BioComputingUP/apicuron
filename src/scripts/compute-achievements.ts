import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ComputeBadgesService } from '../badges/services/compute-badges.service';
import { ComputeMedalsService } from '../medals/services/compute-medals.service';
import { ComputeStatisticsService } from '../statistics/compute-statistics/compute-statistics.service';
import { log } from 'console';
import { BadgeAggregatorService } from 'src/badges/services/badge-aggregator.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	// const computeBadgesService = app.get(ComputeBadgesService);

	// await computeBadgesService.computeResourceBadges({ resource_id: 'disprot' });

	const compStats = app.get(ComputeStatisticsService);
	const compBadges = app.get(BadgeAggregatorService);
	const compMedals = app.get(ComputeMedalsService);

	await compStats.computeStatistics({});

	console.log('Computing Achievements');
	await Promise.all([
		compBadges.createBadges(),
		compMedals.computeMedals(),
	]);

	console.log('Done!');

	await app.close();
}

bootstrap();

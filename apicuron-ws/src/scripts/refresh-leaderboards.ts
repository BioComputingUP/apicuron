import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MonthlyStatisticsAggregator } from 'src/monthly-statistics/services/monthly-stat-aggregator.service';
import { WeeklyStatisticsAggregatorService } from 'src/weekly-statistics/services/weekly-stat-aggregator.service';
import { AppModule } from '../app.module';

async function bootstrap() {
    const logger = new Logger('RefreshLeaderboardsLogger');
    
    const args = process.argv.slice(2);
    const resourceIdIndex = args.findIndex((arg) => arg === '--resource-id');
    const resourceId = resourceIdIndex !== -1 ? args[resourceIdIndex + 1] : null;

    if (!resourceId) {
        logger.error('Please provide a resource_id using --resource-id flag');
        logger.error(
            'Usage: node dist/scripts/refresh-leaderboards.js --resource-id <resource_id>',
        );
        process.exit(1);
    }


	const app = await NestFactory.createApplicationContext(AppModule);

	const aggregators = [
		MonthlyStatisticsAggregator,
		WeeklyStatisticsAggregatorService,
	];
	const promises = aggregators.map((aggregator) => {
		logger.log(`Refreshing ${aggregator.name}...`);
		return app.get(aggregator).recomputeAllResourceAggregates(resourceId);
	});

	await Promise.all(promises);

	await app.close();
}

if (require.main === module) {
	console.log('called directly');
	bootstrap();
}

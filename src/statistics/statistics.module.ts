import { Module } from '@nestjs/common';
import {
	OldStatisticsController,
	StatisticsController,
} from './statistics/statistics.controller';
import { StatisticsService } from './statistics.service';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { CoreApicuronModule } from '../core/core.module';
import { ComputeStatisticsService } from './compute-statistics.service';
import { CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import {
	PublicStatistics,
	PublicStatisticsFactory,
} from './schema/public-statistics.schema';

@Module({
	imports: [
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		AchievementsModule,
		CacheModule.register({
			max: 100,
		}),
		MongooseModule.forFeatureAsync([
			{
				name: PublicStatistics.name,
				useFactory: PublicStatisticsFactory,
			},
		]),
	],
	controllers: [StatisticsController, OldStatisticsController],
	providers: [StatisticsService, ComputeStatisticsService],
	exports: [ComputeStatisticsService],
})
export class StatisticsModule {}

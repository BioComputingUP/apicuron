import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ConfigService } from '@nestjs/config';
import { ResourcesModule } from '../resources/resources.module';
import { HttpModule } from '@nestjs/axios';
import { TermsModule } from '../terms/terms.module';
import { SchedulerClientModule } from '../scheduler-client/scheduler-client.module';
// import { SubmitBulkTask } from './tasks/submit_bulk.task';
import { AchievementsModule } from '../achievements/achievements.module';
// import { ComputeBadgesTask } from './tasks/compute_badges.task';
// import { ComputeMedalsTask } from './tasks/compute_medals.task';
// import { ComputeAchievementsTask } from './tasks/compute_achievements.task';
// import { ComputeStatisticsTask } from './tasks/compute_statistics.task';
import { StatisticsModule } from '../statistics/statistics.module';
import { NotificationsModule } from '../notifications/notifications.module';
// import { ComputeAllMetricsTask } from './tasks/compute_all_metrics.task';
import { EntityUriValid } from './validators/entity-uri';
import { CoreApicuronModule } from '../core/core.module';

@Module({
	controllers: [ReportsController,],
	providers: [ReportsService, EntityUriValid,
		
	],
	imports: [
		HttpModule,
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		TermsModule,
		AchievementsModule,
		NotificationsModule,
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
			}),
		}),
		// SchedulerModule.registerTasks([
		// 	{
		// 		provide: 'task:submit_report',
		// 		useFactory: (task: SubmitBulkTask) => task
		// 	},
		// 	{
		// 		provide: 'task:compute_badges',
		// 		useFactory: (task: ComputeBadgesTask) => task
		// 	},
		// 	{
		// 		provide: 'task:compute_medals',
		// 		useFactory: (task: ComputeMedalsTask) => task
		// 	},
		// 	{
		// 		provide: 'task:compute_achievements',
		// 		useFactory: (task: ComputeAchievementsTask) => task
		// 	},
		// 	{
		// 		provide: 'task:compute_statistics',
		// 		useFactory: (task: ComputeStatisticsTask) => task
		// 	}
		// ]),
		SchedulerClientModule,
		StatisticsModule
	],
	exports: [ReportsService]
})
export class ReportsModule { }


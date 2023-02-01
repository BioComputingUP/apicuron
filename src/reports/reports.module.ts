import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ReportsController, ReportsControllerV2 } from './reports.controller';
import { Report, ReportSchema } from './reports.schema';
import { ReportsService } from './reports.service';
import { ConfigService } from '@nestjs/config';
import { ResourcesModule } from '../resources/resources.module';
import { HttpModule } from '@nestjs/axios';
import { TermsModule } from '../terms/terms.module';
import { SchedulerClientModule } from '../scheduler-client/scheduler-client.module';
import { SubmitBulkTask } from './tasks/submit_bulk.task';
import { AchievementsModule } from '../achievements/achievements.module';
import { ComputeBadgesTask } from './tasks/compute_badges.task';
import { ComputeMedalsTask } from './tasks/compute_medals.task';
import { ComputeAchievementsTask } from './tasks/compute_achievements.task';
import { ComputeStatisticsTask } from './tasks/compute_statistics.task';
import { StatisticsModule } from '../statistics/statistics.module';

@Module({
	controllers: [ReportsControllerV2, ReportsController,],
	providers: [ReportsService,
		{
			provide: 'task:submit_bulk',
			useClass: SubmitBulkTask
		},
		{
			provide: 'task:compute_badges',
			useClass: ComputeBadgesTask
		},
		{
			provide: 'task:compute_medals',
			useClass: ComputeMedalsTask
		},
		{
			provide: 'task:compute_achievements',
			useClass: ComputeAchievementsTask
		},
		{
			provide: 'task:compute_statistics',
			useClass: ComputeStatisticsTask
		}
	],
	imports: [
		HttpModule,
		AuthModule,
		ResourcesModule,
		TermsModule,
		AchievementsModule,
		MongooseModule.forFeature([
			{
				name: Report.name,
				schema: ReportSchema,
			}
		]),
		JwtModule.registerAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ({
				secret: configService.get('JWT_SECRET'),
			}),
		}),
		SchedulerClientModule,
		StatisticsModule
	],
	exports: [ReportsService, MongooseModule]
})
export class ReportsModule { }


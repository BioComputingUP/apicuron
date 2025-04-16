import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SchedulerService } from './services/scheduler.service';
import { Provider } from '@nestjs/common/interfaces/modules';
import { SubmitBulkTask } from './tasks/submit_bulk.task';
import { ComputeBadgesTask } from './tasks/compute_badges.task';
import { ComputeMedalsTask } from './tasks/compute_medals.task';
import { ComputeAchievementsTask } from './tasks/compute_achievements.task';
import { ComputeStatisticsTask } from './tasks/compute_statistics.task';
import { ComputeAllMetricsTask } from './tasks/compute_all_metrics.task';
import { CoreApicuronModule } from '../core/core.module';
import { ResourcesModule } from '../resources/resources.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrcidSubmissionTask } from './tasks/orcid-submission.task';
import { StatisticsModule } from '../statistics/statistics.module';
import { SubmitReportModule } from '../submit-reports/submit-reports.module';
import { BadgesModule } from '../badges/badges.module';
import { MedalsModule } from '../medals/medals.module';

const Tasks = [
	ComputeBadgesTask,
	ComputeMedalsTask,
	SubmitBulkTask,
	ComputeAchievementsTask,
	ComputeStatisticsTask,
	ComputeAllMetricsTask,
]

import { UpdateAllUsersInfoTask } from './tasks/update_all_user_info.task';
import { OrcidClientModule } from '../orcid/orcid-client/orcid-client.module';
@Module({
	imports: [
		HttpModule,
		CoreApicuronModule,
		NotificationsModule,
		ResourcesModule,
		SubmitReportModule,
		MedalsModule,
		BadgesModule,
		StatisticsModule,
		AuthModule,
		OrcidClientModule,
	],
	providers: [
		...Tasks,
		
		// {
		// 	provide: 'task:submit_report',
		// 	useClass: SubmitBulkTask,
		// },
		// {
		// 	provide: 'task:compute_badges',
		// 	useClass: ComputeBadgesTask,
		// },
		// {
		// 	provide: 'task:compute_medals',
		// 	useClass: ComputeMedalsTask,
		// },
		// {
		// 	provide: 'task:compute_achievements',
		// 	useClass: ComputeAchievementsTask,
		// },
		// {
		// 	provide: 'task:compute_statistics',
		// 	useClass: ComputeStatisticsTask,
		// },
		// {
		// 	provide: 'task:compute_all_metrics',
		// 	useClass: ComputeAllMetricsTask,
		// },
		// {
		// 	provide: 'task:submit-orcid',
		// 	useClass: OrcidSubmissionTask,
		// },
	],
	exports: [
		...Tasks,
		// {
		// 	provide: 'task:submit_report',
		// 	useClass: SubmitBulkTask,
		// },
		// {
		// 	provide: 'task:compute_badges',
		// 	useClass: ComputeBadgesTask,
		// },
		// {
		// 	provide: 'task:compute_medals',
		// 	useClass: ComputeMedalsTask,
		// },
		// {
		// 	provide: 'task:compute_achievements',
		// 	useClass: ComputeAchievementsTask,
		// },
		// {
		// 	provide: 'task:compute_statistics',
		// 	useClass: ComputeStatisticsTask,
		// },
		// {
		// 	provide: 'task:compute_all_metrics',
		// 	useClass: ComputeAllMetricsTask,
		// },
		// {
		// 	provide: 'task:submit-orcid',
		// 	useClass: OrcidSubmissionTask,
		// },
	],
	controllers: [],
})
export class SchedulerModule {
	// dynamic modules explained here
	// https://dev.to/nestjs/providing-providers-to-dynamic-nestjs-modules-1i6n
	static registerTasks(tasks: Provider[]) {
		return {
			module: SchedulerModule,
			providers: [...tasks, HttpModule],
			exports: [SchedulerService],
		};
	}
}

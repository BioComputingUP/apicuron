import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { loadConfig } from './config/load';
import { ReportsModule } from './reports/reports.module';
import { ResourcesModule } from './resources/resources.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { NotificationsModule } from './notifications/notifications.module';
import { TermsModule } from './terms/terms.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SchedulerClientModule } from './scheduler-client/scheduler-client.module';
import { EmailModule } from './email/email.module';
import { CoreApicuronModule } from './core/core.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SubmitReportModule } from './submit-reports/submit-reports.module';
import { OrcidSubmissionModule } from './orcid/orcid-submission/orcid-submission.module';
import { ResourceManagerModule } from './resource-manager/resource-manager.module';
import { DetailedStatisticsModule } from './detailed-statistics/detailed-statistics.module';
import { WeeklyStatisticsModule } from './weekly-statistics/weekly-statistics.module';
import { BadgesModule } from './badges/badges.module';
import { MedalsModule } from './medals/medals.module';
import { AchievementsModule } from './achievements/achievements.module';
import { loadSentryModule } from './plugins/sentry';
import { EventOrchestratorModule } from './event-orchestrator/event-orchestrator.module';
import { ResourceStatsModule } from './resource-stats/resource-stats.module';
import { MonthlyStatisticsModule } from './monthly-statistics/monthly-statistics.module';
import { CuratorRegistryModule } from './curator-registry/curator-registry.module';
import { OrcidFetcherModule } from './github-scraper/github-scraper.module';
import { StorageManagerModule } from '@biocomputingup/nest-storage-manager';
import { StorageModuleOptions } from './storage/storage.config';
import { ServeFilesController } from './storage/serve-files.controller';
import { getGlobalInterceptorChain } from './shared/interceptors';
import {
	EntriesExistRule,
	EntryExistsRule,
	UniqueRule,
} from './shared/validators';
@Module({
	imports: [
		// Sentry Setup
		...loadSentryModule(),
		EventEmitterModule.forRoot({
			// wildcard: true,
			global: true,
		}),

		ScheduleModule.forRoot(),
		AuthModule,
		MulterModule.register({
			dest: '/tmp/apicuron/',
		}),
		// isGlobal loads Config Module globally, doesn't require imports
		ConfigModule.forRoot({
			isGlobal: true,
			// ignoreEnvFile: true,
			load: [loadConfig()],
		}),

		// In here we load the StorageManagerModule to manage the storage of files
		StorageManagerModule.forRoot(StorageModuleOptions),

		// in here we load the Serve static module to serve static files
		// ServeStaticModule.forRootAsync({
		// 	inject: [ConfigService, InjectEngine(StorageType.public)],
		// 	useFactory: async (
		// 		configService: ConfigService,
		// 		engine: Engine<LocalFsEngine>,
		// 	) => [
		// 		{
		// 			rootPath: resolve(configService.get('PUBLIC_FILES_PATH')),
		// 			serveRoot: configService.get('PUBLIC_FILES_URL_PATH'),
		// 		},
		// 	],
		// }),
		OrcidSubmissionModule,
		CoreApicuronModule,
		ResourcesModule,
		TermsModule,
		ReportsModule,
		SubmitReportModule,
		StatisticsModule,
		NotificationsModule,
		ResourceManagerModule,
		SchedulerModule,
		SchedulerClientModule,
		EmailModule,
		DetailedStatisticsModule,
		WeeklyStatisticsModule,
		MonthlyStatisticsModule,
		MedalsModule,
		BadgesModule,
		AchievementsModule,
		EventOrchestratorModule,
		ResourceStatsModule,
		CuratorRegistryModule,
		OrcidFetcherModule,
	],
	controllers: [AppController, ServeFilesController],
	providers: [
		AppService,
		UniqueRule,
		EntryExistsRule,
		EntriesExistRule,
		...getGlobalInterceptorChain(),
	],
})
export class AppModule {}

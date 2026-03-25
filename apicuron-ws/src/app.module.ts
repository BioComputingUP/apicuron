import { StorageManagerModule } from '@biocomputingup/nest-storage-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { AchievementsModule } from './achievements/achievements.module';
import { AdminModule } from './admin/admin.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BadgesModule } from './badges/badges.module';
import { loadConfig } from './config/load';
import { CoreApicuronModule } from './core/core.module';
import { CuratorRegistryModule } from './curator-registry/curator-registry.module';
import { DetailedStatisticsModule } from './detailed-statistics/detailed-statistics.module';
import { EmailModule } from './email/email.module';
import { EventOrchestratorModule } from './event-orchestrator/event-orchestrator.module';
import { OrcidFetcherModule } from './github-scraper/github-scraper.module';
import { MedalsModule } from './medals/medals.module';
import { MonthlyStatisticsModule } from './monthly-statistics/monthly-statistics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrcidClientModuleOptions } from './orcid/orcid-client/interfaces/orcid.interface';
import { OrcidClientModule } from './orcid/orcid-client/orcid-client.module';
import { OrcidSubmissionModule } from './orcid/orcid-submission/orcid-submission.module';
import { OrcidSyncModule } from './orcid/orcid-sync/orcid-sync.module';
import { ReportsModule } from './reports/reports.module';
import { ResourceManagerModule } from './resource-manager/resource-manager.module';
import { ResourceStatsModule } from './resource-stats/resource-stats.module';
import { ResourcesModule } from './resources/resources.module';
import { SchedulerClientModule } from './scheduler-client/scheduler-client.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { getGlobalInterceptorChain } from './shared/interceptors';
import {
	EntriesExistRule,
	EntryExistsRule,
	UniqueRule
} from './shared/validators';
import { StatisticsModule } from './statistics/statistics.module';
import { ServeFilesController } from './storage/serve-files.controller';
import { StorageModuleOptions } from './storage/storage.config';
import { SubmitReportModule } from './submit-reports/submit-reports.module';
import { TermsModule } from './terms/terms.module';
import { WeeklyStatisticsModule } from './weekly-statistics/weekly-statistics.module';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
@Module({
	imports: [
		// Sentry Setup
		SentryModule.forRoot(),
		EventEmitterModule.forRoot({
			// wildcard: true,
			global: true,
		}),

		ScheduleModule.forRoot(),
		OrcidClientModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (config: ConfigService): OrcidClientModuleOptions => {
				return {
					apiUrl: config.getOrThrow<string>('ORCID_API_URL'),
					client_id: config.getOrThrow<string>('ORCID_CLIENT_ID'),
					client_secret: config.getOrThrow<string>('ORCID_CLIENT_SECRET'),
					scopes: ['/read-limited', '/activities/update'],
					loadOnStartup: config.get<string>('environment') != 'local',
				};
			},
		}),
		AuthModule,
		MulterModule.register({
			dest: '/tmp/apicuron/',
		}),
		// isGlobal loads Config Module globally, doesn't require imports
		ConfigModule.forRoot({
			isGlobal: true,
			// ignoreEnvFile: true,
			skipProcessEnv: true,
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
		OrcidSyncModule,
		AdminModule,
	],
	controllers: [AppController, ServeFilesController],
	providers: [
		{
			provide: APP_FILTER,
			useClass: SentryGlobalFilter,
		},
		AppService,
		UniqueRule,
		EntryExistsRule,
		EntriesExistRule,
		...getGlobalInterceptorChain(),
	],
})
export class AppModule {}

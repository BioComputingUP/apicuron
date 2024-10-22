import { Module, Logger, ClassSerializerInterceptor } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { loadConfig } from './config/load';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { ReportsModule } from './reports/reports.module';
import { ResourcesModule } from './resources/resources.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { NotificationsModule } from './notifications/notifications.module';
import { TermsModule } from './terms/terms.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { UniqueRule } from './shared/validators/unique.validator';
import {
	EntriesExistRule,
	EntryExistsRule,
} from './shared/validators/entry-exists.validator';
import { SchedulerClientModule } from './scheduler-client/scheduler-client.module';
import { TransformInterceptor } from './shared/transformer/transform.interceptor';
import { EmailModule } from './email/email.module';
import { CoreApicuronModule } from './core/core.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoEventsModule } from './mongo-events/mongo-events.module';
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
import { Reflector } from '@nestjs/core';
import { ResourceStatsModule } from './resource-stats/resource-stats.module';
import { MonthlyStatisticsModule } from './monthly-statistics/monthly-statistics.module';

const logger = new Logger('AppModule');

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

		// MongoEventsModule,
		// in here we use the forRootAsync https://docs.nestjs.com/techniques/mongodb#async-configuration
		// to be able to access the configService asnchronously because it cannot be loaded sooner
		// due to the fact that this is the appmodule
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			imports: [MongoEventsModule],
			useFactory: async (
				configService: ConfigService,
			): Promise<MongooseModuleOptions> => {
				const db_host = configService.get<string>('db_host');
				const database = configService.get<string>('database');
				const port = configService.get<number>('db_port');
				const uri = `mongodb://${db_host}:${port}/${database}`;
				logger.log(`MongoDB Connection setup uri: ${uri}`);
				return {
					uri,
				};
			},
		}),
		// in here we load the Serve static module to serve static files
		ServeStaticModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => [
				{
					rootPath: resolve(configService.get('PUBLIC_FILES_PATH')),
					serveRoot: configService.get('PUBLIC_FILES_URL_PATH'),
				},
			],
		}),
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
	],
	controllers: [AppController],
	providers: [
		AppService,
		UniqueRule,
		EntryExistsRule,
		EntriesExistRule,
		TransformInterceptor,
		{
			provide: ClassSerializerInterceptor,
			inject: [Reflector],
			useFactory: (reflect: Reflector) => {
				return new ClassSerializerInterceptor(reflect, {
					enableCircularCheck: true,
				});
			},
		},
	],
})
export class AppModule {}

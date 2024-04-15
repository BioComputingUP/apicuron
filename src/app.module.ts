import { HttpException, Module, Logger } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
import { AchievementsModule } from './achievements/achievements.module';
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
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { EmailModule } from './email/email.module';
import { CoreApicuronModule } from './core/core.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MongoEventsModule } from './mongo-events/mongo-events.module';
import { SubmitReportModule } from './submit-reports/submit-reports.module';
import { CacheModule } from '@nestjs/cache-manager';
import { OrcidClientModule } from './orcid-client/orcid-client.module';
import { OrcidSubmissionModule } from './orcid-submission/orcid-submission.module';
import { ResourceManagerModule } from './resource-manager/resource-manager.module';
const logger = new Logger('AppModule');

@Module({
	imports: [
		// Sentry Setup
		SentryModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (cfg: ConfigService) => ({
				dsn: 'https://c2d718a504bb4e42971684f3049099c3@o4505266554470400.ingest.sentry.io/4505266764251136',
				debug: true,
				environment: cfg.get<string>('environment'),
				logLevels: ['debug', 'error', 'log', 'error', 'warn'],
				release: '2.0.0',
			}),
		}),

		CacheModule.register({
			store: 'memory',
			shouldCloneBeforeSet: false,
		}),

		EventEmitterModule.forRoot({
			wildcard: true,
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
		OrcidClientModule,
		OrcidSubmissionModule,
		CoreApicuronModule,
		ResourcesModule,
		TermsModule,
		ReportsModule,
		SubmitReportModule,
		StatisticsModule,
		AchievementsModule,
		NotificationsModule,
		ResourceManagerModule,
		SchedulerModule,
		SchedulerClientModule,
		EmailModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
		UniqueRule,
		EntryExistsRule,
		EntriesExistRule,
		TransformInterceptor,
		// App interceptor to capture errors
		{
			provide: APP_INTERCEPTOR,
			useFactory: () =>
				new SentryInterceptor({
					filters: [
						{
							type: HttpException,
							filter: (exception: HttpException) => {
								return exception.getStatus() >= 500;
							},
						},
					],
				}),
		},
	],
})
export class AppModule {}

import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
// import { PrismaModule } from './prisma/prisma.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsModule } from './reports/reports.module';
import { ResourcesModule } from './resources/resources.module';
import { StatisticsModule } from './statistics/statistics.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import devConfig from './config/configuration.dev';
import prodConfig from './config/configuration.prod';
import { join, resolve } from 'path';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { TransformerModule } from './shared/transformer/transformer.module';
import { AchievementsModule } from './achievements/achievements.module';
import { NotificationsModule } from './notifications/notifications.module';
function getConfig() {
	if (process.env.NODE_ENV === 'development') {
		return devConfig;
	}
	if (process.env.NODE_ENV === 'production') {
		return prodConfig;
	}
	return devConfig;
}


@Module({
	imports: [
		ScheduleModule.forRoot(),
		AuthModule,
		MulterModule.register({
			dest: '/tmp/apicuron/',
		}),
		// isGlobal loads Config Module globally, doesn't require imports
		ConfigModule.forRoot({
			isGlobal: true,
			// ignoreEnvFile: true,
			load: [getConfig()],
		}),
		// in here we use the forRootAsync https://docs.nestjs.com/techniques/mongodb#async-configuration
		// to be able to access the configService asnchronously because it cannot be loaded sooner
		// due to the fact that this is the appmodule
		MongooseModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => {
				const db_host = configService.get<string>('db_host')
				const database = configService.get<string>('database')
				const port = configService.get<number>('port')
				return ({
					uri: `mongodb://${db_host}:${port}/${database}`,
				})
			},
		}),
		// in here we load the Serve static module to serve static files
		ServeStaticModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (configService: ConfigService) => ([{
				rootPath: resolve(configService.get('PUBLIC_FILES_PATH')),
				serveRoot: '/public',
			}]),
		}),
		
		ResourcesModule,
		ReportsModule,
		StatisticsModule,
		TransformerModule,
		AchievementsModule,
		NotificationsModule,
		// SharedValidatorsModule
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

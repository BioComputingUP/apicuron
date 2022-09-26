import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';

async function bootstrap() {
	// App creation
	const app = await NestFactory.create(AppModule);

	// setup express middlewares
	app.use(cookieParser());

	// Logging and config setup
	const appLogger = new Logger('APICURONApplicationLogger');
	const configService = app.get(ConfigService);

	app.use(
		[
			'/leaderboards',
			'/profile',
			// '/reports',
			// '/stat',
			// '/homepage_statistics',
			'/getProfilePictureID/',
			'/getProfilePicture/',
			'/postProfilePicture',
			'/hideProfile',
			'/showProfile',
			'/getProfile',
			'/orcid_update',
			'/resubmit_activity',
			'/submit_activity',
			'/delete_activity',
			// '/resources',
		],
		createProxyMiddleware({
			target: configService.get('V1_HOST'),
			changeOrigin: true,
		}),
	);

	// setup basic validation Pipes
	app.useGlobalPipes(
		new ValidationPipe({
			disableErrorMessages: configService.get('environment') != 'development',
		}),
	);

	// retrieving port, host and other configurations
	const port = configService.get('PORT');
	const host = configService.get('HOST');
	const envConfig = configService.get<string>('environment');

	// if (envConfig == 'development') {
	// }
	app.enableCors();

	// Logging startup
	appLogger.log(`Loaded ${envConfig} Configuration`);
	appLogger.log(`Started Listening on http://${host}:${port}`);

	// exec('npm run start-dev', {
	// 	cwd: `${__dirname}/old`,
	// });

	app.enableVersioning({
		type: VersioningType.HEADER,
		header: 'version',
	});

	// starting to listen to requests
	await app.listen(port, host);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { exec } from 'child_process';

async function bootstrap() {
	// App creation
	const app = await NestFactory.create(AppModule);

	// setup express middlewares
	app.use(cookieParser());

	app.use(
		[
			'/leaderboards',
			'/stat',
			'/homepage_statistics',
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
      '/resources'
		],
		createProxyMiddleware({
			target: 'http://localhost:8198/',
			changeOrigin: true,
		}),
	);

	// Logging and config setup
	const appLogger = new Logger('APICURONApplicationLogger');
	const configService = app.get(ConfigService);

	// setup basic validation Pipes
	app.useGlobalPipes(new ValidationPipe());

	// retrieving port, host and other configurations
	const port = configService.get('PORT');
	const host = configService.get('HOST');
	const envConfig = configService.get<string>('environment');

	// Logging startup
	appLogger.log(`Loaded ${envConfig} Configuration`);
	appLogger.log(`Started Listening on http://${host}:${port}`);

  exec('npm run start-dev', {
    cwd: `${__dirname}/old`
  })

	// starting to listen to requests
	await app.listen(port, host);
}

bootstrap();

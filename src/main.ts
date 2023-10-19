import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { TransformInterceptor } from './shared/transformer/transform.interceptor';
import { setupSwagger } from './swagger/setup';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
	// App creation
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Logging and config setup
	const appLogger = new Logger('APICURONApplicationLogger');
	const configService = app.get(ConfigService);

	// retrieving port, host and other configurations
	const port = configService.get('PORT');
	const host = configService.get('HOST');
	const envConfig = configService.get<string>('environment');

	// class-validator setup
	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	// set the global transform pipe
	const transformer = app.get(TransformInterceptor);
	app.useGlobalInterceptors(transformer);

	// setup express middlewares
	app.use(cookieParser());

	// swagger UI setup
	setupSwagger(app, configService.get<string>('API_DOCS_PREFIX'));

	// setup basic validation Pipes
	app.useGlobalPipes(
		new ValidationPipe({
			transformOptions: {
				enableImplicitConversion: true,
			},
			stopAtFirstError: true,
			transform: true,
			forbidUnknownValues: false,
			skipMissingProperties: false,
			whitelist: true,
		}),
	);

	app.enableCors();

	// Logging startup
	appLogger.log(`Loaded ${envConfig} Configuration`);
	appLogger.log(`Started Listening on http://${host}:${port}`);

	app.enableVersioning({
		type: VersioningType.HEADER,
		header: 'version',
	});

	// setup the static handler
	app.useStaticAssets(join(__dirname, '..', 'public'));
	app.setBaseViewsDir(join(__dirname, '..', 'views'));
	app.setViewEngine('hbs');

	// generateAllAvatars(app);

	// addPrivacyField(app);

	// starting to listen to requests
	await app.listen(port, host);
}

bootstrap();

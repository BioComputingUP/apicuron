import './plugins/sentry';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { setupSwagger } from 'src/plugins/swagger/setup';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { setupExpressErrorHandler } from '@sentry/node';
// import { SentryGlobalFilter } from '@sentry/nestjs/setup';

async function bootstrap() {
	// App creation
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	// Logging and config setup
	const appLogger = new Logger('APICURONApplicationLogger');
	const configService: ConfigService = app.get(ConfigService);

	// retrieving port, host and other configurations
	const port = configService.getOrThrow<number>('PORT');
	const host = configService.getOrThrow<string>('HOST');
	const envConfig = configService.getOrThrow<string>('environment');

	// setup sentry

	// class-validator setup
	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	// set the global transform pipe
	// const transformer = app.get(TransformInterceptor);
	// app.useGlobalInterceptors(transformer);
	const expressApp = app.getHttpAdapter().getInstance();
	setupExpressErrorHandler(expressApp);

	// Load global interceptors

	// setup express middlewares
	app.use(cookieParser());

	// swagger UI setup
	setupSwagger(app, configService.getOrThrow<string>('API_DOCS_PREFIX'));

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

	app.enableShutdownHooks();

	// starting to listen to requests
	// await app.listen(port, host);
	await app.listen(port, host);
}

if (require.main === module) {
	void bootstrap();
}

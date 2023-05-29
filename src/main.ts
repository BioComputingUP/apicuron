import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { TransformInterceptor } from './shared/transformer/transform.interceptor';
import { setupSwagger } from './swagger/setup'
import * as Sentry from "@sentry/node";
import { Application } from "express";


async function bootstrap() {
	// App creation
	const app = await NestFactory.create(AppModule);

	// Logging and config setup
	const appLogger = new Logger('APICURONApplicationLogger');
	const configService = app.get(ConfigService);

	// retrieving port, host and other configurations
	const port = configService.get('PORT');
	const host = configService.get('HOST');
	const envConfig = configService.get<string>('environment');

	// ************************** Sentry setup start **************************
	if (['production', 'development'].includes(envConfig)) {
		// obtain the express app instance
		const expressApp: Application = app.getHttpAdapter().getInstance();

		// Must configure Sentry before doing anything else with it
		Sentry.init({
			dsn: "https://c2d718a504bb4e42971684f3049099c3@o4505266554470400.ingest.sentry.io/4505266764251136",
			integrations: [
				// enable HTTP calls tracing
				new Sentry.Integrations.Http({ tracing: true }),
				// enable Express.js middleware tracing
				new Sentry.Integrations.Express({ app:expressApp }),
				// Automatically instrument Node.js libraries and frameworks
				...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
			],

			// Set tracesSampleRate to 1.0 to capture 100%
			// of transactions for performance monitoring.
			// We recommend adjusting this value in production
			tracesSampleRate: .5,
		});

		// RequestHandler creates a separate execution context, so that all
		// transactions/spans/breadcrumbs are isolated across requests
		app.use(Sentry.Handlers.requestHandler());
		// TracingHandler creates a trace for every incoming request
		app.use(Sentry.Handlers.tracingHandler());

		expressApp.get("/debug-sentry", function mainHandler(req, res) {
			throw new Error("My first Sentry error!");
		  });

	}
	// ************************** Sentry setup end **************************
	

	// class-validator setup
	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	// set the global transform pipe
	const transformer = app.get(TransformInterceptor)
	app.useGlobalInterceptors(transformer)

	// setup express middlewares
	app.use(cookieParser());


	// swagger UI setup
	setupSwagger(app, configService.get<string>('API_DOCS_PREFIX'))


	// setup basic validation Pipes
	app.useGlobalPipes(
		new ValidationPipe({ transform: true, forbidUnknownValues: false }),
	);



	app.enableCors();

	// Logging startup
	appLogger.log(`Loaded ${envConfig} Configuration`);
	appLogger.log(`Started Listening on http://${host}:${port}`);


	app.enableVersioning({
		type: VersioningType.HEADER,
		header: 'version',
	});

	// starting to listen to requests
	await app.listen(port, host);
}

bootstrap();

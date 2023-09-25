import { INestApplication, Logger } from '@nestjs/common';
import { Application } from 'express';
import * as Sentry from "@sentry/node";
import { SentryModule } from '@ntegral/nestjs-sentry';
import { ConfigService } from '@nestjs/config';

const DSN = 'https://c2d718a504bb4e42971684f3049099c3@o4505266554470400.ingest.sentry.io/4505266764251136'


export function setupSentry(app: INestApplication, logger: Logger, environment: string) {

	// obtain the express app instance
	const expressApp: Application = app.getHttpAdapter().getInstance();

	// Must configure Sentry before doing anything else with it
	Sentry.init({
		dsn: DSN,
		integrations: [
			// enable HTTP calls tracing
			new Sentry.Integrations.Http({ tracing: true }),
			// enable Express.js middleware tracing
			new Sentry.Integrations.Express({ app: expressApp }),
			// Automatically instrument Node.js libraries and frameworks
			...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
		],

		// Set tracesSampleRate to 1.0 to capture 100%
		// of transactions for performance monitoring.
		// We recommend adjusting this value in production
		tracesSampleRate: .5,
		// specify environment
		environment
	});

	logger.log('Sentry Initialized')


	// RequestHandler creates a separate execution context, so that all
	// transactions/spans/breadcrumbs are isolated across requests
	app.use(Sentry.Handlers.requestHandler());
	// TracingHandler creates a trace for every incoming request
	app.use(Sentry.Handlers.tracingHandler());

	if (environment == 'local') {
		expressApp.get("/debug-sentry", function mainHandler(req, res) {
			throw new Error("My first Sentry error!");
		});

	}

}


export function loadSentryModule(){
	
	return [
		SentryModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (cfg: ConfigService) => ({
				dsn: DSN,
				debug: true,
				environment: cfg.get<string>('environment'),
				logLevels: ['debug', 'error', 'log', 'error', 'warn']
			})
		}),
	]
}
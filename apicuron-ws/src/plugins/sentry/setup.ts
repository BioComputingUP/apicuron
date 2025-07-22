import {
	ConfigurableModuleBuilder,
	HttpException,
	INestApplication,
	Logger,
	Module,
} from '@nestjs/common';
import { SentryInterceptor, SentryModule } from '@ntegral/nestjs-sentry';
import { ConfigService } from '@nestjs/config';

const DSN =
	'https://c2d718a504bb4e42971684f3049099c3@o4505266554470400.ingest.sentry.io/4505266764251136';

export function setupSentry(
	app: INestApplication,
	logger: Logger,
	configService: ConfigService,
) {
	const sentryInterceptor = new SentryInterceptor({
		filters: [
			{
				type: HttpException,
				filter: (exception: HttpException) => {
					return exception.getStatus() >= 500;
				},
			},
		],
	});

	const interceptors =
		configService.get<string>('environment') !== 'local'
			? [sentryInterceptor]
			: [];

	logger.log(
		`Sentry Loaded ${
			interceptors.length
		} interceptors for environment: ${configService.get<string>(
			'environment',
		)}`,
	);

	app.useGlobalInterceptors(...interceptors);
}

export function loadSentryModule() {
	if (!process.env.NODE_ENV || process.env.NODE_ENV === 'local') {
		return [];
	}
	return [
		SentryModule.forRootAsync({
			inject: [ConfigService],
			useFactory: async (cfg: ConfigService) => ({
				dsn: DSN,
				debug: true,
				environment: cfg.get<string>('environment'),
				logLevels: ['debug', 'error', 'log', 'error', 'warn'],
			}),
		}),
	];
}

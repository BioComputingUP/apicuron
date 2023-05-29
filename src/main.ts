import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { createProxyMiddleware, fixRequestBody, responseInterceptor } from 'http-proxy-middleware';
import { useContainer } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './shared/transformer/transform.interceptor';

async function bootstrap() {
	// App creation
	const app = await NestFactory.create(AppModule);

	// class-validator setup
	useContainer(app.select(AppModule), { fallbackOnErrors: true });

	// set the global transform pipe
	const transformer = app.get(TransformInterceptor)
	app.useGlobalInterceptors(transformer)


	// setup express middlewares
	app.use(cookieParser());

	// Logging and config setup
	const appLogger = new Logger('APICURONApplicationLogger');
	const configService = app.get(ConfigService);

	
	// setup for swagger docs generation
	const swaggerConfig = new DocumentBuilder()
		.setTitle('APICURON V2')
		.setTitle('APICURON API Documentation')
		.setDescription('The APICURON API Documentation')
		.setVersion('2.0')
		.addTag('Resources')
		.addTag('Partner Resources')
		.addTag('Users')
		.addTag('Curation Terms')
		.addTag('Achievements Definition')
		.setBasePath('/api/')
		.build()

	// setting the global prefix for the api docs generation
	app.setGlobalPrefix(configService.get<string>('API_DOCS_PREFIX'))
	

	const document = SwaggerModule.createDocument(app, swaggerConfig, {
		ignoreGlobalPrefix: false
	})

	SwaggerModule.setup('/', app, document, {
		useGlobalPrefix: false,
	})


	// resetting the prefix for the proxy routing 
	app.setGlobalPrefix('')



	// setup basic validation Pipes
	app.useGlobalPipes(
		new ValidationPipe({ transform: true, forbidUnknownValues: false }),
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

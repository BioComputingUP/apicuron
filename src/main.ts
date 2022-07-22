import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  // App creation
  const app = await NestFactory.create(AppModule);

  // setup express middlewares
  app.use(cookieParser());

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

  // starting to listen to requests
  await app.listen(port, host);
}

bootstrap();

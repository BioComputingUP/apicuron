import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // App creation
  const app = await NestFactory.create(AppModule);

  // Logging and config setup
  const appLogger = new Logger('APICURONApplicationLogger');
  const configService = app.get(ConfigService);

  // setup basic validation Pipes
  app.useGlobalPipes(new ValidationPipe());
  // retrieving port
  const port = configService.get('PORT');
  const host = configService.get('HOST');
  const envConfig = configService.get<string>('environment');
  appLogger.log(`Loaded ${envConfig} Configuration`)
  appLogger.log(`Started Listening on ${host}:${port}`);
  await app.listen(port, host);
}

bootstrap();

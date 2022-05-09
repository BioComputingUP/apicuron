import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3000;
  const appLogger = new Logger('appLogger');
  app.useGlobalPipes(new ValidationPipe());
  appLogger.log(`Started Listening on Port ${port}`);
  await app.listen(3000);
}

bootstrap();

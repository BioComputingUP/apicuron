import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 3000
  console.log(`Started Listening on Port ${port}`)
  await app.listen(3000);
}

bootstrap();

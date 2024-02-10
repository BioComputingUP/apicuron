import { NestFactory, repl } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	useContainer(app.select(AppModule), { fallbackOnErrors: true });
	await repl(AppModule);
}
bootstrap();

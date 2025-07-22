import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { InitializationService } from '../event-orchestrator/services/initialization.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const logger = new Logger('RefreshAggregatesLogger');

	await app.get(InitializationService).initializeAggregateData();

	await app.close();
}

if (require.main === module) {
	console.log('called directly');
	bootstrap();
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ComputeBadgesService } from '../achievements/services/compute-badges.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const computeBadgesService = app.get(ComputeBadgesService);

	await computeBadgesService.computeResourceBadges({ resource_id: 'disprot' });

	await app.close();
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ComputeBadgesService } from '../badges/services/compute-badges.service';
import { ComputeMedalsService } from '../medals/services/compute-medals.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	// const computeBadgesService = app.get(ComputeBadgesService);

	// await computeBadgesService.computeResourceBadges({ resource_id: 'disprot' });

	const compMedal = app.get(ComputeMedalsService);

	await compMedal.computeMedals({});

	console.log('Done!');

	await app.close();
}

bootstrap();

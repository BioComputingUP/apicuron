import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from 'src/app.module';
import { PartnerResourceRepository } from 'src/core/repositories/partner-resource.repository';
import { UserRepository } from 'src/core/repositories/user.repository';
import { StorageType } from 'src/storage/storage.config';

async function migrateAll() {
	const app = await NestFactory.createApplicationContext(AppModule);
	const logger = new Logger('StorageMigrationLogger');

	const storageService: StorageService = app.get(StorageService);
	const userRep = app.get(UserRepository);
	const resourceRep = app.get(PartnerResourceRepository);

	const source = StorageType.public;
	const target = StorageType.private;

	const migrateUserAndResourceUrls = async (
		sourceUrl: string,
		destUrl: string,
	) => {
		try {
			await Promise.all([
				userRep.updateMany(
					{ avatar: sourceUrl },
					{ $set: { avatar: destUrl } },
				),
				resourceRep.updateMany(
					{ logo: sourceUrl },
					{ $set: { logo: destUrl } },
				),
			]);
			logger.verbose(`Updated URLs from ${sourceUrl} to ${destUrl}`);
		} catch (error: unknown) {
			if (error instanceof Error) {
				logger.error(`Error updating URLs: ${error.message}`);
				throw error;
			}
		}
	};
	logger.verbose(`Starting migration from ${source} to ${target}`);
	try {
		await storageService.migrateAll(source, target, migrateUserAndResourceUrls);
		logger.verbose(`Migration from ${source} to ${target} completed`);
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error(`Migration failed: ${error.message}`);

			return;
		}
	}
	await app.close();
}

migrateAll();

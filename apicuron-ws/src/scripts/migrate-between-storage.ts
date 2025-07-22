import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from 'src/app.module';
import { PartnerResourceRepository } from 'src/core/repositories/partner-resource.repository';
import { UserRepository } from 'src/core/repositories/user.repository';
import { StorageType } from 'src/storage/storage.config';

async function migrateAll() {
	const app = await NestFactory.createApplicationContext(AppModule);
	await app.init();
	const logger = new Logger('StorageMigrationLogger');
	const storageService: StorageService = await app.get(StorageService);
	const userRep = await app.get(UserRepository);
	const resourceRep = await app.get(PartnerResourceRepository);

	const source = StorageType.public;
	const target = StorageType.private;

	// const source = StorageType.private;
	// const target = StorageType.public;

	const migrateUserAndResourceUrls = async (
		sourceUrl: string,
		destUrl: string,
	) => {
		try {
			await Promise.all([
				userRep.updateOne({ avatar: sourceUrl }, { $set: { avatar: destUrl } }),
				resourceRep.updateOne({ logo: sourceUrl }, { $set: { logo: destUrl } }),
			]);
			logger.verbose(`Updated URLs from ${sourceUrl} to ${destUrl}`);
		} catch (error: unknown) {
			if (error instanceof Error) {
				logger.error(`lalilulelo: ${error.message}`);
				throw error;
			}
		}
	};

	try {
		await storageService.migrateAll(
			source,
			target,
			migrateUserAndResourceUrls,
			{ maxConcurrency: 1, deleteFromSource: false },
		);
		// await userRep.updateOne({}, { $set: { acceptsEmails: true } });
		// logger.warn('Updated user acceptsEmails to true');
	} catch (error: unknown) {
		if (error instanceof Error) {
			logger.error(`Migration failed: ${error.message}`);
		}
	} finally {
		await app.close();
	}
}

migrateAll();

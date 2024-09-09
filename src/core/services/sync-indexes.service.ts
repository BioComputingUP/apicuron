import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class SyncIndexesService implements OnModuleInit {
	constructor(@InjectConnection() private readonly connection: Connection) {}
	logger = new Logger(SyncIndexesService.name);
	async onModuleInit() {
		await this.syncAllIndexes();
	}

	async syncAllIndexes() {
		const models = this.connection.models;

		const indexesSyncPromises$ = Object.entries(models).map(
			([modelName, model]) => {
				this.logger.log(`Syncing indexes for model: ${modelName}`);
				return model.syncIndexes();
			},
		);

		try {
			await Promise.all(indexesSyncPromises$);
		} catch (err) {
			this.logger.error(`Error syncing indexes: ${err?.message}`);
		}
	}
}

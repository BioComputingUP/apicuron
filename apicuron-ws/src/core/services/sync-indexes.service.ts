import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, MongooseError } from 'mongoose';

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
			async ([modelName, model]) => {
				return await this.syncIndexesForModel(model);
			},
		);

		try {
			await Promise.all(indexesSyncPromises$);
		} catch (err) {
			this.logger.error(`Error Occured when syncing indexes: ${err?.message}`);
		}
	}

	async syncIndexesForModel(model: Model<unknown>) {
		this.logger.log(`Syncing indexes for model: ${model.modelName}`);
		let synced = false;
		while (!synced) {
			try {
				await model.syncIndexes();
				synced = true;
			} catch (err) {
				if (err.code == 11000) {
					// Duplicate key error
					// extract the key causing the error
					this.logger.error(
						`Duplicate key error: while syncing indexes for model: ${model.modelName}. Deleting culprits`,
					);
					const errorKey = err.keyValue;
					await model.deleteMany(errorKey);
					continue;
				}
				this.logger.error(
					`Error syncing indexes for model: ${model.modelName}, not handled`,
				);
				synced = true;
			}
		}
	}
}

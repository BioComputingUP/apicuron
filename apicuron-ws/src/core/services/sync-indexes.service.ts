import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { MongoServerError } from 'mongodb';

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
			this.logger.log(err);
		}
	}

	async syncIndexesForModel(model: Model<unknown>) {
		this.logger.log(`Syncing indexes for model: ${model.modelName}`);
		let synced = false;
		while (!synced) {
			try {
				await model.syncIndexes();
				synced = true;
			} catch (error) {
				const isDuplicate =
					error instanceof MongoServerError && error.code === 11000;
				const detail = isDuplicate
					? `duplicate key ${JSON.stringify(
							error.keyValue,
					  )} blocks a unique index`
					: error instanceof Error
					? error.message
					: String(error);
				this.logger.error(
					`Index sync failed for model ${model.modelName}: ${detail}. ` +
						`Resolve the conflicting documents, No data was modified.`,
					error instanceof Error ? error.stack : undefined,
				);
				throw error; // refuse to start rather than run without the constraint
			}
		}
	}
}

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Aggregator } from '../interfaces/aggregator.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { BulkSubmissionRunner } from '../aggregator-runners/bulk-submission.runner';

@Injectable()
export class InitializationService implements OnApplicationBootstrap {
	constructor(
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		protected configService: ConfigService,
		protected aggregatorManager: BulkSubmissionRunner,
	) {}
	async onApplicationBootstrap() {
		if (this.configService.get<string>('environment') == 'local') {
			return;
		}
		// const initPromise$ = this.initializeAggregateData();
	}
	logger = new Logger(InitializationService.name);

	async initializeAggregateData() {
		this.logger.debug(`InitializationService initialized with aggregator `);

		const resources = await this.resourceModel.find();

		const tasks$ = resources.map(
			async ({ resource_id }: PartnerResourceDocument) => {
				return await this.aggregatorManager.run(
					async (aggregator: Aggregator) => {
						return await aggregator.recomputeAllResourceAggregates(resource_id);
					},
				);
			},
		);

		await Promise.all(tasks$);
	}
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Aggregator } from '../interfaces/aggregator.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { AggregatorManager } from './aggregator-manager.service';

@Injectable()
export class InitializationService implements OnModuleInit {
	constructor(
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		protected configService: ConfigService,
		protected aggregatorManager: AggregatorManager,
	) {}
	logger = new Logger(InitializationService.name);
	async onModuleInit() {
		if (this.configService.get<string>('environment') == 'local') {
			return;
		}

		await this.initializeAggregateData();
	}

	async initializeAggregateData() {
		this.logger.debug(`InitializationService initialized with aggregator `);

		const resources = await this.resourceModel.find();

		await this.aggregatorManager.runOnAggregators(
			async (aggregator: Aggregator) => {
				const updates$ = resources.map(
					async ({ resource_id }: PartnerResourceDocument) => {
						await aggregator.recomputeAllResourceAggregates(resource_id);
					},
				);

				await Promise.all(updates$);
				this.logger.debug(
					`InitializationService completed for Aggregator ${aggregator.constructor.name}`,
				);
				return;
			},
		);
	}
}

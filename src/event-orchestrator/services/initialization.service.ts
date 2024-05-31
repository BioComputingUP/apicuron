import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from '../event-orchestrator.module-definition';
import { EventOrchestratorModuleOptions } from '../interfaces/event-orchestrator-options.interface';
import { Aggregator } from '../interfaces/aggregator.interface';
import { InjectModel } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InitializationService implements OnModuleInit {
	aggregator: Aggregator;
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN)
		protected options: EventOrchestratorModuleOptions,
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		protected configService: ConfigService,
	) {
		this.aggregator = options.aggregator;
	}
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

		const updates$ = resources.map(
			async ({ resource_id }: PartnerResourceDocument) => {
				await this.aggregator.removeAllResourceAggregates(resource_id);
				return await this.aggregator.applyAllReports(resource_id);
			},
		);

		await Promise.all(updates$);

		this.logger.debug(
			`InitializationService completed for Aggregator ${this.aggregator.constructor.name}`,
		);
	}
}

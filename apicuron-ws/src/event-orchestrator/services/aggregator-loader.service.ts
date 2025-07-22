import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AGGREGATOR_METADATA } from '../decorators/aggregator.decorator';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { AggregatorEntry } from '../interfaces/aggregator.interface';

@Injectable()
export class AggregatorLoader implements OnModuleInit {
	constructor(
		protected discovery: DiscoveryService,
		protected reflector: Reflector,
	) {}

	logger: Logger = new Logger(AggregatorLoader.name);

	onModuleInit() {
		this.loadAllAggregators();
	}

	private aggregatorEntries: AggregatorEntry[] = [];

	private loadAllAggregators() {
		this.discovery.getProviders().forEach((provider: InstanceWrapper) => {
			const instance = provider.instance;
			if (!instance) {
				return;
			}
			const prototype = Object.getPrototypeOf(instance);

			// Check if the class is an aggregator
			const metadata = this.reflector.get(
				AGGREGATOR_METADATA,
				prototype.constructor,
			);
			if (!!metadata) {
				// if it is, add it to the list of aggregators
				this.aggregatorEntries.push({
					aggregator: instance,
					options: metadata,
					name: instance.constructor.name,
				});
			}
		});

		this.logger.log(`Loaded ${this.aggregatorEntries.length} Aggregators`);
	}

	getAggregators(): AggregatorEntry[] {
		return this.aggregatorEntries;
	}
}

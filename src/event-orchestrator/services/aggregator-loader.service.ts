import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CircularDependencyError } from '../errors/circular-dependency';
import { AGGREGATOR_METADATA } from '../decorators/aggregator.decorator';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
	AggregatorEntry,
	AggregatorOptions,
} from '../interfaces/aggregator.interface';

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
				this.validateAggregatorOptions(prototype.constructor.name, metadata);
				// if it is, add it to the list of aggregators
				this.aggregatorEntries.push({
					aggregator: instance,
					options: metadata,
					name: instance.constructor.name,
				});
			}
		});

		this.aggregatorEntries.sort((a, b) => {
			if (a.options.runBefore && a.options.runBefore.includes(b.name)) {
				if (b.options.runBefore && b.options.runBefore.includes(a.name)) {
					throw new CircularDependencyError(a.aggregator, b.aggregator);
				}
				return -1;
			}
			if (b.options.runBefore && b.options.runBefore.includes(a.name)) {
				return 1;
			}
			return 1;
		});

		this.logger.log(`Loaded ${this.aggregatorEntries.length} Aggregators`);
		this.logger.debug(
			`Loaded Aggregators: \n\t${this.aggregatorEntries
				.map((entry) => entry.name)
				.join('\n\t')}`,
		);
	}

	private validateAggregatorOptions(name: string, options: AggregatorOptions) {
		if (!options) {
			return;
		}
		if (options.runBefore) {
			if (!Array.isArray(options.runBefore)) {
				throw new Error(`Invalid runBefore option for aggregator ${name}`);
			}
			if (options.runBefore.includes(name)) {
				throw new Error(`Aggregator ${name} cannot run before itself`);
			}
		}
	}

	getAggregators(): AggregatorEntry[] {
		return this.aggregatorEntries;
	}
}

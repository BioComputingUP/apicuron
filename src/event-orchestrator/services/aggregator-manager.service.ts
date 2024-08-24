import { Injectable } from '@nestjs/common';
import {
	Aggregator,
	AggregatorEntry,
} from '../interfaces/aggregator.interface';
import { AggregatorLoader } from './aggregator-loader.service';

@Injectable()
export class AggregatorManager {
	constructor(protected aggregatorLoader: AggregatorLoader) {
		this.aggregatorEntries = aggregatorLoader.getAggregators();
	}
	private aggregatorEntries: AggregatorEntry[] = [];

	async runOnAggregators(task: (aggregator: Aggregator) => any | Promise<any>) {
		for (const aggregatorEntry of this.aggregatorEntries) {
			await task(aggregatorEntry.aggregator);
		}

		return;
	}

	public getAggregator(name: string): Aggregator {
		return this.aggregatorEntries.find((entry) => entry.name === name)
			.aggregator;
	}

	public getAggregators(): Aggregator[] {
		return this.aggregatorEntries.map((entry) => entry.aggregator);
	}
}

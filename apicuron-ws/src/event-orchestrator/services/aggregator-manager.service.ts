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

	public getAggregator(name: string): Aggregator {
		const result = this.aggregatorEntries.find(
			(entry) => entry.name === name,
		)?.aggregator;
		if (!result) {
			throw new Error(`Aggregator with name ${name} not found`);
		}
		return result;
	}

	public getAggregators(): Aggregator[] {
		return this.aggregatorEntries.map((entry) => entry.aggregator);
	}
}

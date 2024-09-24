import { Injectable } from '@nestjs/common';
import { AggregatorManager } from '../services/aggregator-manager.service';
import { Aggregator } from '../interfaces/aggregator.interface';
import { IRunner } from '../interfaces/runner.interface';

@Injectable()
export class BaseAggregatorRunner implements IRunner {
	constructor(protected manager: AggregatorManager) {}

	async run(fn: (aggregator: Aggregator) => any | Promise<any>) {
		const aggregators = this.manager.getAggregators();

		const results = await Promise.all(aggregators.map(fn));
		return results;
	}
}

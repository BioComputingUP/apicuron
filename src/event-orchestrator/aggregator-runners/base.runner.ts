import { Injectable } from '@nestjs/common';
import { AggregatorManager } from '../services/aggregator-manager.service';
import { Aggregator } from '../interfaces/aggregator.interface';

@Injectable()
export class BaseAggregatorRunner {
	constructor(protected manager: AggregatorManager) {}

	async run(fn: (aggregator: Aggregator) => any | Promise<any>) {
		const aggregators = this.manager.getAggregators();

		const results = await Promise.all(aggregators.map(fn));
		return results;
	}
}

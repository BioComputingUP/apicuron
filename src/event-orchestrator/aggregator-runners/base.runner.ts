import { Injectable } from '@nestjs/common';
import { AggregatorManager } from '../services/aggregator-manager.service';

@Injectable()
export class BaseAggregatorRunner {
	constructor(protected manager: AggregatorManager) {}

	async run(fn: (aggregator: any) => any | Promise<any>) {
		const aggregators = this.manager.getAggregators();

		const results = await Promise.all(aggregators.map(fn));
		return results;
	}
}

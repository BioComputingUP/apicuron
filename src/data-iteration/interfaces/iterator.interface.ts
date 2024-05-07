import { Aggregate } from 'mongoose';

export interface Iterator<AggregationResult, IteratorItem> {
	iterate(
		aggregation: Aggregate<AggregationResult>,
	): AsyncGenerator<IteratorItem>;
}

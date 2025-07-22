import { Aggregator } from '../interfaces/aggregator.interface';

export class CircularDependencyError extends Error {
	constructor(aggregatorA: Aggregator, aggregatorB: Aggregator) {
		const message = `\x1b[31m Circular dependency \x1b[0m detected between Aggregators: ${aggregatorA.constructor.name} and ${aggregatorB.constructor.name} Both have runBefore set to each other.`;
		super(message);
	}
}

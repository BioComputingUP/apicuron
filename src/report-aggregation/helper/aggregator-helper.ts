import { PipelineStage } from 'mongoose';
import { Operation } from '../interfaces/operations.interface';

export function runMapOperations(operations: Operation[]): PipelineStage[] {
	return operations
		.map((operation) => operation.map())
		.filter((stages) => stages.length > 0)
		.flat();
}

export function runGroupOperations(
	operations: Operation[],
): PipelineStage.Group['$group'] {
	const groups = operations
		.map((operation) => operation.group())
		.filter((group) => group !== null);
	return Object.assign({}, ...groups);
}

export function runPostGroupOperations(
	operations: Operation[],
): PipelineStage[] {
	return operations
		.map((operation) => operation.postGroup())
		.filter((stages) => stages.length > 0)
		.flat();
}

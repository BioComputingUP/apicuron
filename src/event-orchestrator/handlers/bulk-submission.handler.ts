import { Injectable } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Aggregator } from '../interfaces/aggregator.interface';
import { BulkSubmissionEvent } from '../../submit-reports/events/events';
import { BulkSubmissionRunner } from '../aggregator-runners/bulk-submission.runner';

@Injectable()
export class BulkReportSubmissionHandler implements IEventHandler {
	constructor(protected bulkSubmissionRunner: BulkSubmissionRunner) {}

	@OnEvent(BulkSubmissionEvent.name, { async: true, promisify: true })
	async handle({ resource_ids }: BulkSubmissionEvent) {
		await this.bulkSubmissionRunner.run(async (aggregator: Aggregator) => {
			const reComputeAggregates$ = resource_ids.map(
				async (resource_id: string) =>
					await aggregator.recomputeAllResourceAggregates(resource_id),
			);

			return await Promise.all(reComputeAggregates$);
		});
	}
}

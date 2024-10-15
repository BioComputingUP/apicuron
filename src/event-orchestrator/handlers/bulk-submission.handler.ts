import { Injectable, Logger } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { OnEvent } from '@nestjs/event-emitter';
import { Aggregator } from '../interfaces/aggregator.interface';
import { BulkSubmissionEvent } from '../../submit-reports/events/events';
import { SubmissionRunner } from '../aggregator-runners/bulk-submission.runner';

@Injectable()
export class BulkReportSubmissionHandler implements IEventHandler {
	constructor(protected bulkSubmissionRunner: SubmissionRunner) {}

	logger = new Logger(BulkReportSubmissionHandler.name);

	@OnEvent(BulkSubmissionEvent.name, { async: true, promisify: true })
	async handle({ resource_ids }: BulkSubmissionEvent) {
		await this.bulkSubmissionRunner.run(async (aggregator: Aggregator) => {
			this.logger.debug(
				`Recomputing aggregates using aggregator: [${aggregator.constructor.name}] for ${resource_ids.length} resources`,
			);
			const reComputeAggregates$ = resource_ids.map(
				async (resource_id: string) =>
					await aggregator.recomputeAllResourceAggregates(resource_id),
			);

			return await Promise.all(reComputeAggregates$);
		});
	}
}

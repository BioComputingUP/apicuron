import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BadgeAggregatorService } from '../../badges/services/badge-aggregator.service';
import { MedalAggregatorService } from '../../medals/services/medal-aggregator.service';
import { ReportAggregatorService } from '../../reports/services/report-aggregator.service';
import { StatisticsAggregator } from '../../statistics/services/statistics-aggregator.service';
import { Aggregator } from '../interfaces/aggregator.interface';
import { IRunner } from '../interfaces/runner.interface';
import { AggregatorManager } from '../services/aggregator-manager.service';

@Injectable()
export class SubmissionRunner implements IRunner, OnModuleInit {
	reportAggregator: ReportAggregatorService;
	statAggregator: StatisticsAggregator;
	badgeAggregator: BadgeAggregatorService;
	medalAggregator: MedalAggregatorService;
	parallelizableAggregators: Aggregator[];
	logger = new Logger(SubmissionRunner.name);
	constructor(protected manager: AggregatorManager) {}

	relevantAggregatorNames: string[] = [
		ReportAggregatorService.name,
		StatisticsAggregator.name,
		BadgeAggregatorService.name,
		MedalAggregatorService.name,
	];

	onModuleInit() {
		const [sequentialAggregators, parallelizableAggregators] = this.init();
		[
			this.reportAggregator,
			this.statAggregator,
			this.badgeAggregator,
			this.medalAggregator,
		] = sequentialAggregators;
		this.parallelizableAggregators = parallelizableAggregators;
	}

	init(): [
		[
			ReportAggregatorService,
			StatisticsAggregator,
			BadgeAggregatorService,
			MedalAggregatorService,
		],
		Aggregator[],
	] {
		const aggregators: Aggregator[] = this.manager.getAggregators();

		// extract the aggregators that are parallelizable
		const parallelizableAggregators = aggregators.filter(
			(aggregator) =>
				!this.relevantAggregatorNames.includes(aggregator.constructor.name),
		);
		const relevantAggregators = this.relevantAggregatorNames.map(
			(name: string) => {
				const agg = aggregators.find(
					(aggregator: Aggregator) => aggregator.constructor.name == name,
				);
				if (!agg) {
					throw new Error(`Aggregator ${name} not found`);
				}
				return agg;
			},
		) as [
			ReportAggregatorService,
			StatisticsAggregator,
			BadgeAggregatorService,
			MedalAggregatorService,
		];

		if (relevantAggregators.length < this.relevantAggregatorNames.length) {
			throw new Error('Missing aggregators');
		}

		return [relevantAggregators, parallelizableAggregators];
	}

	async run(fn: (aggregator: Aggregator) => Promise<void>): Promise<void> {
		const completed_aggregators: string[] = [];
		const failed_aggregators: string[] = [];
		try {
			await fn(this.reportAggregator);
			completed_aggregators.push(this.reportAggregator.constructor.name);
			this.logger.log('Report aggregator completed successfully');
		} catch (error) {
			failed_aggregators.push(this.reportAggregator.constructor.name);
			throw new Error(
				`Report aggregator failed during execution: ${error.message}${
					error.stack ? `\nStack: ${error.stack}` : ''
				}`,
			);
		}
		const parallelizableResults$ = this.parallelizableAggregators.map(fn);

		const sequentialAggregators = [
			this.statAggregator,
			this.badgeAggregator,
			this.medalAggregator,
		];

		const sequentialResults$ = (async () => {
			// order matters
			for (const aggregator of sequentialAggregators) {
				try {
					await fn(aggregator);
					completed_aggregators.push(aggregator.constructor.name);

					this.logger.log(
						`Sequential aggregator ${aggregator.constructor.name} completed successfully`,
					);
				} catch (error) {
					const didntComplete = sequentialAggregators
						.slice(sequentialAggregators.indexOf(aggregator))
						.map((agg) => agg.constructor.name);
					failed_aggregators.push(...didntComplete);
					throw new Error(
						`${aggregator.constructor.name} failed during sequential execution with Error [${error?.name}:${error?.code}]: ${error?.message}` +
							(error?.stack ? `\nStack: ${error?.stack}` : ''),
					);
				}
			}
		})();

		const [seqRes, ...parRes] = await Promise.allSettled([
			sequentialResults$,
			...parallelizableResults$,
		]);
		this.logger.log('SubmissionRunner completed');
		if (seqRes.status === 'rejected') {
			this.logger.error(
				`Sequential aggregators failed: ${seqRes.reason.message}${
					seqRes.reason.stack ? `\nStack: ${seqRes.reason.stack}` : ''
				}`,
			);
		}

		parRes.forEach((result, index) => {
			const aggregatorName: string =
				this.parallelizableAggregators[index].constructor.name;

			if (result.status === 'rejected') {
				this.logger.error(
					`${aggregatorName} failed during execution: ${result.reason}`,
				);
				failed_aggregators.push(aggregatorName);
			} else {
				completed_aggregators.push(aggregatorName);
			}
		});
		this.logger.log(
			`Completed aggregators [${
				completed_aggregators.length
			}]: ${completed_aggregators.join(', ')}`,
		);
		failed_aggregators.length > 0 &&
			this.logger.error(
				`Failed aggregators [${
					failed_aggregators.length
				}]: ${failed_aggregators.join(', ')}`,
			);
	}
}

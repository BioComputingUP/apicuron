import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BadgeAggregatorService } from '../../badges/services/badge-aggregator.service';
import { MedalAggregatorService } from '../../medals/services/medal-aggregator.service';
import { StatisticsAggregator } from '../../statistics/services/statistics-aggregator.service';
import { Aggregator } from '../interfaces/aggregator.interface';
import { AggregatorManager } from '../services/aggregator-manager.service';
import { IRunner } from '../interfaces/runner.interface';

@Injectable()
export class SubmissionRunner implements IRunner, OnModuleInit {
	statAggregator: StatisticsAggregator;
	badgeAggregator: BadgeAggregatorService;
	medalAggregator: MedalAggregatorService;
	parallelizableAggregators: Aggregator[];
	logger = new Logger(SubmissionRunner.name);
	constructor(protected manager: AggregatorManager) {}

	relevantAggregatorNames: string[] = [
		StatisticsAggregator.name,
		BadgeAggregatorService.name,
		MedalAggregatorService.name,
	];

	onModuleInit() {
		const [sequentialAggregators, parallelizableAggregators] = this.init();
		[this.statAggregator, this.badgeAggregator, this.medalAggregator] =
			sequentialAggregators;
		this.parallelizableAggregators = parallelizableAggregators;
	}

	init(): [
		[StatisticsAggregator, BadgeAggregatorService, MedalAggregatorService],
		Aggregator[],
	] {
		const aggregators: Aggregator[] = this.manager.getAggregators();

		// extract the aggregators that are parallelizable
		const parallelizableAggregators = aggregators.filter(
			(aggregator) =>
				!this.relevantAggregatorNames.includes(aggregator.constructor.name),
		);
		const relevantAggregators = this.relevantAggregatorNames.map(
			(name: string) =>
				aggregators.find(
					(aggregator: Aggregator) => aggregator.constructor.name == name,
				),
		) as [StatisticsAggregator, BadgeAggregatorService, MedalAggregatorService];

		if (
			relevantAggregators.includes(undefined) ||
			relevantAggregators.length < 3 ||
			relevantAggregators.includes(null)
		) {
			throw new Error('Missing aggregators');
		}

		return [relevantAggregators, parallelizableAggregators];
	}

	async run(fn: (aggregator: any) => any | Promise<any>) {
		const parallelizableResults$ = Promise.all(
			this.parallelizableAggregators.map(fn),
		);

		const sequentialResutls$ = (async () => {
			await fn(this.statAggregator);
			await fn(this.badgeAggregator);
			await fn(this.medalAggregator);
		})();

		await Promise.all([parallelizableResults$, sequentialResutls$]);
	}
}

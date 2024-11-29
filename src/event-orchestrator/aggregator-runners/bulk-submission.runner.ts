import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BadgeAggregatorService } from '../../badges/services/badge-aggregator.service';
import { MedalAggregatorService } from '../../medals/services/medal-aggregator.service';
import { StatisticsAggregator } from '../../statistics/services/statistics-aggregator.service';
import { Aggregator } from '../interfaces/aggregator.interface';
import { AggregatorManager } from '../services/aggregator-manager.service';
import { IRunner } from '../interfaces/runner.interface';
import { ReportAggregatorService } from '../../reports/services/report-aggregator.service';

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
			(name: string) =>
				aggregators.find(
					(aggregator: Aggregator) => aggregator.constructor.name == name,
				),
		) as [
			ReportAggregatorService,
			StatisticsAggregator,
			BadgeAggregatorService,
			MedalAggregatorService,
		];

		if (
			relevantAggregators.includes(undefined) ||
			relevantAggregators.length < this.relevantAggregatorNames.length ||
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
		await fn(this.reportAggregator);

		const sequentialResutls$ = (async () => {
			await fn(this.statAggregator);
			await fn(this.badgeAggregator);
			await fn(this.medalAggregator);
		})();

		await Promise.all([parallelizableResults$, sequentialResutls$]);
	}
}

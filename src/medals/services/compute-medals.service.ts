import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { Cursor, FilterQuery, Model } from 'mongoose';
import {
	MedalDef,
	MedalDefDocument,
} from '../../core/schemas/achievements-def/medal-def.schema';
import { MedalDefReportsUserSummary } from '../interfaces/aggregated-reports';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';
import { AchievementState } from '../../core/enums';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as _ from 'lodash';

@Injectable()
export class ComputeMedalsService {
	constructor(
		protected eventEmitter: EventEmitter2,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(MedalDef.name)
		protected medalDefModel: Model<MedalDefDocument>,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
	) {}

	logger = new Logger(ComputeMedalsService.name);

	/**
	 * Creates Medals by processing aggregated reports filtered by medal definition.
	 *
	 * @param medalDef - The medal definition document.
	 * @param aggregatedReports - The aggregated reports by medal definition.
	 * @param resource - The partner resource document.
	 * @param rankIndex - The rank index.
	 * @returns The state of the medal obtained for the user
	 */
	private async processAggregatedReportsByMedalDef(
		medalDef: MedalDefDocument,
		aggregatedReports: MedalDefReportsUserSummary,
		rankIndex: number,
	): Promise<AchievementState> {
		const earned = rankIndex + 1 <= medalDef.score_relative;
		const achievementState = earned
			? AchievementState.achieved
			: AchievementState.progress;
		const medal = new this.medalModel({
			...medalDef.toObject(),
			_id: undefined,
			curator_orcid: aggregatedReports.curator_orcid,
			last_day: medalDef?.last_day,
			first_day: medalDef?.first_day,
			count_total: aggregatedReports.count,
			score_total: aggregatedReports.score_total,
			state: achievementState,
			score_relative_valid: earned,
			score_relative_index: rankIndex,
		});
		medal.privacy = computeAggregatePrivacyField(medalDef, aggregatedReports);

		try {
			await medal.save();
			this.logger.debug(
				`Saved medal ${medalDef.name} for ${aggregatedReports.curator_orcid}`,
			);
			return AchievementState.achieved;
		} catch (err) {
			if (err instanceof Error) {
				this.logger.error(err.message, err.stack, err.name);
				throw new Error(
					`An error occured while creating medal ${medalDef.name} for curator ${aggregatedReports.curator_orcid} in resource ${medalDef.resource_id}`,
				);
			}
		}
	}

	public async computeMedalsForMedalDef(medalDef: MedalDefDocument) {
		const reportsAgg = this.medalReportsAggregationCursor(medalDef);

		const medalAsyncIterator = (async function* () {
			let i = 0;
			for await (const reportWithCount of reportsAgg) {
				yield [reportWithCount, i] as [MedalDefReportsUserSummary, number];
				i++;
			}
			return;
		})();

		const aggReportsPromises$: Promise<AchievementState>[] = [];

		for await (const [aggregatedReports, idx] of medalAsyncIterator) {
			const aggReportsPromise$ = this.processAggregatedReportsByMedalDef(
				medalDef,
				aggregatedReports,
				idx,
			);
			aggReportsPromises$.push(aggReportsPromise$);
		}

		const medalsStates = await Promise.all(aggReportsPromises$);

		// takes the list of medal states computed for a specific MedalDef
		// splits into lists of achieved and progress
		// These two lists then are counted and retrieved into "achieved" and "progress"
		const medalDefCounts: [number, number] = _.partition(
			medalsStates,
			(state: AchievementState) => state == AchievementState.achieved,
		).map((states: AchievementState[]) => states.length) as [number, number];

		this.logger.debug(
			`Computed ${medalsStates.length} medals for ${medalDef.name}`,
		);
		return medalDefCounts;
	}

	/**
	 * This function leverages the computeMedalsForMedalDef function to recalculate the medals for a specific medal
	 * @param medalDef The medal definition concerned
	 * @returns a pair of counts, the number of medals achieved as a first element and the number of calculated medals in progress
	 */
	public async reComputeMedalsForMedalDef(medalDef: MedalDefDocument) {
		const medalsDeleted = await this.medalModel.deleteMany({
			name: medalDef.name,
			resource_id: medalDef.resource_id,
			league: medalDef.league,
		});

		return await this.computeMedalsForMedalDef(medalDef);
	}

	/**
	 * Builds a report filter based on the given medal criteria.
	 * @param medal - The medal definition to match against reports.
	 * @returns The filter query object for matching related reports.
	 */
	public matchRelatedReports(
		medal: MedalDefDocument,
	): FilterQuery<ReportDocument> {
		// first we first filter all the reports by the resource
		// and the terms that are concerned by the medals
		const reportFilter: FilterQuery<ReportDocument> = {
			resource_id: medal.resource_id,
			activity_term: {
				$in: medal.list_terms,
			},
			league: medal.league,
		};

		// if the medal has a time constraint we make sure it's added to the filter
		if (medal.first_day) {
			reportFilter['timestamp'] = { $gte: medal.first_day };
		}

		if (medal.last_day) {
			// if the timestamp object doesn't exist, it is created otherwise it is updated
			if (!reportFilter['timestamp']) {
				reportFilter['timestamp'] = { $lte: medal.last_day };
			} else {
				reportFilter['timestamp'] = {
					...reportFilter['timestamp'],
					$lte: medal.last_day,
				};
			}
		}

		return reportFilter;
	}

	/**
	 * Retrieves a cursor for aggregating medal reports.
	 * This function groups reports by user while counting all sorts of stats regarding the tasks
	 * Specifically the total score
	 *
	 * @param medal - The medal definition document.
	 * @param cursorOptions - The options for the cursor (default: { batchSize: 50 }).
	 * @returns A cursor for aggregating reports by user for a specific medalDef.
	 */
	private medalReportsAggregationCursor(
		medal: MedalDefDocument,
		cursorOptions: { batchSize: number } = { batchSize: 50 },
	): Cursor<MedalDefReportsUserSummary> {
		const reportFilter = this.matchRelatedReports(medal);

		return (
			this.reportModel
				.aggregate()
				.match(reportFilter)
				// here we lookup and unwind from the terms_def collection to get the term score
				.lookup({
					from: this.termModel.collection.name,
					localField: 'activity_term',
					foreignField: 'activity_term',
					as: 'term',
				})
				.unwind({ path: '$term' })
				.project({
					curator_orcid: 1,
					activity_term: 1,
					score: '$term.score',
					resource_id: 1,
					privacy: 1,
				})
				// # here we group by curator while computing the count and score sum
				.group({
					_id: '$curator_orcid',
					curator_orcid: {
						$first: '$curator_orcid',
					},
					activity_terms: {
						$addToSet: '$activity_term',
					},
					resource_id: {
						$first: '$resource_id',
					},
					count: {
						$sum: 1,
					},
					score_total: {
						$sum: '$score',
					},
					privacy: {
						$first: '$privacy',
					},
				})
				// and we sort the output in decreasing order based on the score_total
				.sort({
					score_total: -1,
				})
				.cursor(cursorOptions)
		);
	}

	public async computeMedals(
		medalDefFilter: FilterQuery<MedalDefDocument> = {},
	) {
		await this.medalModel.deleteMany(medalDefFilter);

		const medalDefs = this.medalDefModel
			.find(medalDefFilter)
			.cursor({ batchSize: 50 });
		const medalDefCountsPromises$: Promise<[number, number]>[] = [];
		for await (const medalDef of medalDefs) {
			const medalDefCountsPromise$ = this.computeMedalsForMedalDef(medalDef);
			medalDefCountsPromises$.push(medalDefCountsPromise$);
		}
		const medalComputedCounts = await Promise.all(medalDefCountsPromises$);

		const [totalAchieved, totalProgress] = medalComputedCounts.reduce(
			(val: [number, number], curr: [number, number]) => [
				val[0] + curr[0],
				val[1] + curr[1],
			],
			[0, 0],
		);

		this.logger.debug(`Computed ${medalComputedCounts.length} medals`);

		return totalAchieved;
	}
}

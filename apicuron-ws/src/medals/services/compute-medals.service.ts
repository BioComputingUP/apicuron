import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Cursor, FilterQuery, LeanDocument, Model } from 'mongoose';
import { Transform } from 'node:stream';
import { from, Observable, switchMap, tap, timer } from 'rxjs';
import { UsersService } from 'src/auth/users/services/users.service';
import { User, UserDocument } from 'src/core/schemas/index';
import { AchievementState } from '../../core/enums';
import {
	MedalDef,
	MedalDefDocument,
} from '../../core/schemas/achievements-def/medal-def.schema';
import {
	Medal,
	MedalDocument,
	MedalModel,
} from '../../core/schemas/achievements/medals.schema';
import {
	LeanReportDocument,
	Report,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import { MedalEarnedEvent } from '../events/medal-earned.event';
import { GetrelatedReportFilter } from '../helpers/helpers';
import { MedalDefReportsUserSummary } from '../interfaces/aggregated-reports';

export function create<T>(model: Model<T>, data: T) {
	return new model(data);
}
@Injectable()
export class ComputeMedalsService {
	constructor(
		protected eventEmitter: EventEmitter2,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(MedalDef.name)
		protected medalDefModel: Model<MedalDefDocument>,
		@InjectModel(Medal.name) protected medalModel: MedalModel,
		protected userService: UsersService,
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
	private makeMedalFromMedalDefReports(
		medalDef: MedalDef,
		aggregatedReports: MedalDefReportsUserSummary,
		user: User,
		rankIndex: number,
	): MedalDocument {
		const earned = rankIndex + 1 <= medalDef.score_relative;
		const achievementState = earned
			? AchievementState.achieved
			: AchievementState.progress;

		const medalDoc = new this.medalModel<Medal>({
			name: medalDef.name,
			user,
			resource_id: medalDef.resource_id,
			league: medalDef.league,
			list_terms: medalDef.list_terms,
			color: medalDef.color,
			score_relative: medalDef.score_relative,
			privacy: computeAggregatePrivacyField(medalDef, aggregatedReports),
			resource_uri: medalDef.resource_uri,
			createdAt: new Date(),
			updatedAt: new Date(),
			count_relative_index: rankIndex,
			count_relative_valid: true,
			count_threshold_valid: true,
			score_threshold_valid: true,
			curator_orcid: aggregatedReports.curator_orcid,
			last_day: medalDef?.last_day,
			first_day: medalDef?.first_day,
			count_total: aggregatedReports.count,
			score_total: aggregatedReports.score_total,
			state: achievementState,
			score_relative_valid: earned,
			score_relative_index: rankIndex,
		});

		return medalDoc;
	}
	private async saveMedal(medal: MedalDocument): Promise<AchievementState> {
		try {
			await this.medalModel.create(medal);
			this.logger.debug(`Saved medal ${medal.name} for ${medal.curator_orcid}`);
			return AchievementState.achieved;
		} catch (err: unknown) {
			if (err instanceof Error) {
				this.logger.error(err.message, err.stack, err.name);
				throw new Error(
					`processAggregatedReportsByMedalDef: An error occured while creating medal ${medal.name} for curator ${medal.curator_orcid} in resource ${medal.resource_id}`,
				);
			} else {
				throw new Error(
					`An unknown error occurred while creating medal ${medal.name} for curator ${medal.curator_orcid} in resource ${medal.resource_id}`,
				);
			}
		}
	}

	public async *generateMedalsForDef(
		medalDef: LeanDocument<MedalDefDocument>,
	): AsyncGenerator<MedalDocument> {
		const reportsAgg = this.medalReportsAggregationCursor(medalDef);
		let rankingCounter = 0;
		for await (const reportWithCount of reportsAgg) {
			const medal = this.makeMedalFromMedalDefReports(
				medalDef,
				reportWithCount,
				reportWithCount.user,
				rankingCounter,
			);
			yield medal;
			rankingCounter++;
		}
		return;
	}

	public streamMedalsForMedalDef(
		medalDef: LeanDocument<MedalDefDocument>,
	): Observable<MedalDocument> {
		const medalAsyncIterator = this.generateMedalsForDef(medalDef);
		return from(medalAsyncIterator);
	}

	public async computeMedalsForMedalDef(medalDef: MedalDefDocument) {
		this.logger.debug(`Computing medals for MedalDef: ${medalDef.name}`);

		const saveMedalsPromises$: Promise<AchievementState>[] = [];

		for await (const medal of this.generateMedalsForDef(medalDef)) {
			this.logger.debug(
				`Saving medal ${medal.name} for curator ${medal.curator_orcid}`,
			);
			const saveMedalPromise$ = this.saveMedal(medal);
			saveMedalsPromises$.push(saveMedalPromise$);
		}
		const medalsStates = await Promise.all(saveMedalsPromises$);

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
		this.logger.debug(
			`Deleted ${medalsDeleted.deletedCount} medals for ${medalDef.name}`,
		);
		return await this.computeMedalsForMedalDef(medalDef);
	}

	/**
	 * Retrieves a cursor for aggregating medal reports.
	 * This function groups reports by user while counting all sorts of stats regarding the tasks
	 * Specifically the total score
	 *
	 * @param medalDef - The medal definition document.
	 * @param cursorOptions - The options for the cursor (default: { batchSize: 50 }).
	 * @returns A cursor for aggregating reports by user for a specific medalDef.
	 */
	private medalReportsAggregationCursor(
		medalDef: MedalDefDocument | LeanDocument<MedalDefDocument>,
		cursorOptions: { batchSize: number } = { batchSize: 50 },
	): Cursor<MedalDefReportsUserSummary> {
		const reportFilter = GetrelatedReportFilter(medalDef);

		const response = this.reportModel
			.aggregate()
			.match(reportFilter)
			.project({
				curator_orcid: 1,
				activity_term: 1,
				score: '$term.score',
				resource_id: 1,
				privacy: 1,
				term: 1,
				user: 1,
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
				user: {
					$first: '$user',
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
			.cursor(cursorOptions);

		return response;
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

		const [totalAchieved, _] = medalComputedCounts.reduce(
			(val: [number, number], curr: [number, number]) => [
				val[0] + curr[0],
				val[1] + curr[1],
			],
			[0, 0],
		);

		this.logger.debug(`Computed ${medalComputedCounts.length} medals`);

		return totalAchieved;
	}

	public async reComputeMedals(filter: FilterQuery<MedalDefDocument>) {
		await this.medalModel.deleteMany(filter);
		return await this.computeMedals(filter);
	}

	async updateMedalsEarnedState(medalDef: MedalDefDocument): Promise<number> {
		this.logger.verbose(
			`Compute Medals Earned for ${medalDef.name} score_relative: ${medalDef.score_relative}`,
		);
		const earnedMedalsList = await this.medalModel
			.find(
				{
					resource_id: medalDef.resource_id,
					league: medalDef.league,
					name: medalDef.name,
				},
				null,
				{ sort: { score_total: -1 } },
			)
			.limit(medalDef.score_relative);

		if (earnedMedalsList.length === 0) {
			this.logger.debug(
				`No medals earned for ${medalDef.name} for resource ${medalDef.resource_id}`,
			);
			return 0;
		}

		const lowestMedalEarned: MedalDocument =
			earnedMedalsList[earnedMedalsList.length - 1];

		this.logger.debug(
			`Lowest Medal (${lowestMedalEarned.name}) Earned is by ${lowestMedalEarned.curator_orcid} has score ${lowestMedalEarned.score_total}`,
		);

		// update all medals that are lower than the lowest medal earned
		const updateLower = this.medalModel.updateMany(
			{
				name: medalDef.name,
				resource_id: medalDef.resource_id,
				league: medalDef.league,
				score_total: { $lt: lowestMedalEarned.score_total },
			},
			{ $set: { state: AchievementState.progress } },
		);

		// update all medals that are higher than the lowest medal earned

		const updateEarnedPromises$ = earnedMedalsList
			.filter(
				(medal: MedalDocument) => medal.state == AchievementState.progress,
			)
			.map(async (medal, idx) => {
				medal.state = AchievementState.achieved;
				medal.score_relative_index = idx;

				return await medal.save();
			});
		const earnedMedals = await Promise.all(updateEarnedPromises$);

		await updateLower;

		this.logger.debug(
			`Medal ${medalDef.name} earned by ${earnedMedals.length} curators`,
		);

		const MedalEearnedEvents$ = earnedMedals.map((medal) =>
			this.eventEmitter.emitAsync(
				MedalEarnedEvent.name,
				new MedalEarnedEvent(medal),
			),
		);

		await Promise.all(MedalEearnedEvents$);

		return earnedMedals.length;
	}

	async createOrUpdateMedal(
		medalDef: MedalDefDocument,
		report: ReportDocument | LeanReportDocument,
		term: TermDocument,
	) {
		const medal = await this.medalModel.findOneAndUpdate(
			{
				resource_id: report.resource_id,
				league: report.league,
				list_terms: report.activity_term,
				curator_orcid: report.curator_orcid,
				name: medalDef.name,
			},
			{
				$inc: {
					count_total: 1,
					score_total: term.score,
				},
				$setOnInsert: {
					color: medalDef.color,
					list_terms: medalDef.list_terms,
					score_relative: medalDef.score_relative,
					count_relative_valid: false,
					score_threshold_valid: false,
					privacy: computeAggregatePrivacyField(medalDef, report),
					state: AchievementState.progress,
				},
			},
			{
				upsert: true,
			},
		);

		if (!!medal) {
			this.logger.verbose(
				`Medal ${medal.name} updated for ${medal.curator_orcid}`,
			);
		}

		const earnedMedalsCount = await this.updateMedalsEarnedState(medalDef);
		this.logger.verbose(
			` ${earnedMedalsCount} Medals earned for ${medalDef.name}`,
		);
		return earnedMedalsCount;
	}
}

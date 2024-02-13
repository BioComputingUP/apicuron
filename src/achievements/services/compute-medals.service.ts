import { Injectable, Logger } from '@nestjs/common';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { Model, MongooseError } from 'mongoose';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import {
	MedalDef,
	MedalDefDocument,
} from '../../core/schemas/achievements-def/medal-def.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import 'mongodb';
import { AchievementState } from '../../core/enums';

@Injectable()
export class ComputeMedalsService {
	constructor(
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
		protected partnerResourceService: PartnerResourcesService,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(MedalDef.name) private medalDefModel: Model<MedalDefDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
	) {}

	logger = new Logger(ComputeMedalsService.name);

	async computeResourceMedals({ resource_id }: { resource_id: string }) {
		const deletionResponse = await this.medalModel.deleteMany({ resource_id });
		this.logger.log(
			`Deleted ${deletionResponse.deletedCount} medals for resource ${resource_id}`,
		);

		// const { data: medalDefs } = await this.achievementsDefService.get_medals(MedalsFilter.create({ resource_id }))

		const medalDefs = await this.medalDefModel.find({
			resource_id,
		});

		const medal_saves_promises = [];

		for await (const medalDef of medalDefs) {
			// for each medal definition in the list, we add the medal to the user

			this.logger.debug(`Working on Medal ${medalDef.name}`);

			const user_reports = this.medalReportsAggregation(medalDef)
				.limit(medalDef.score_relative)
				.cursor();

			// user_reports is sorted based on their scores, we just need to load the 'n' first
			// users where 'n' is the score_relative of the medal
			let score_relative_index = 0;
			for await (const user of user_reports) {
				if (!user) {
					continue;
				}
				const medalObject = medalDef.toObject();
				delete medalObject['_id'];
				this.logger.debug(
					`Checking if user ${user['_id']['curator_orcid']} earned  ${medalDef.name}`,
				);

				const medal = new this.medalModel({
					...medalObject,
					_id: null,
					curator_orcid: user['_id']['curator_orcid'],
					count_total: user['count'],
					score_total: user['score_sum'],
					score_relative_index,
					count_relative_valid: true,
					count_threshold_valid: true,
					score_threshold_valid: true,
				});
				score_relative_index++;
				medal_saves_promises.push(medal.save());
			}
		}

		this.logger.log(
			`${medal_saves_promises.length} curators earned medals for resource ${resource_id}`,
		);
		await Promise.all(medal_saves_promises);
	}

	private medalReportsAggregation(medal: MedalDefDocument) {
		// first we first filter all the reports by the resource
		// and the terms that are concerned by the medals
		const match_dict = {
			resource_id: medal.resource_id,
			activity_term: {
				$in: medal.list_terms,
			},
		};

		// if the medal has a time constraint we make sure it's added to the filter
		if (medal.first_day) {
			match_dict['timestamp'] = { $gte: medal.first_day };
		}

		if (medal.last_day) {
			// if the timestamp object doesn't exist, it is created otherwise it is updated
			if (!match_dict['timestamp']) {
				match_dict['timestamp'] = { $lte: medal.last_day };
			} else {
				match_dict['timestamp'] = {
					...match_dict['timestamp'],
					$lte: medal.last_day,
				};
			}
		}
		return (
			this.reportModel
				.aggregate()
				.match(match_dict)
				// # here we lookup and unwind from the terms_def collection to get the term score
				.lookup({
					from: 'terms_def',
					localField: 'activity_term',
					foreignField: 'activity_term',
					as: 'result',
				})
				.unwind({ path: '$result' })
				.project({
					curator_orcid: 1,
					activity_term: 1,
					score: '$result.score',
				})
				// # here we group by curator while computing the count and score sum
				.group({
					_id: {
						curator_orcid: '$curator_orcid',
					},
					count: {
						$sum: 1,
					},
					score_sum: {
						$sum: '$score',
					},
				})
				// and we sort the output in decreasing order based on the score_sum
				.sort({
					score_sum: -1,
				})
		);
	}

	private async upsertMedalForReport(
		medalDef: MedalDefDocument,
		report: ReportDocument,
		term: TermDocument,
	) {
		const { resource_id, curator_orcid } = report;
		try {
			return await this.medalModel.updateOne(
				{
					curator_orcid: curator_orcid,
					resource_id: resource_id,
					name: medalDef.name,
				},
				{
					$setOnInsert: {
						...medalDef.toObject(),
					},
					$inc: {
						count_total: 1,
						score_total: term.score,
					},
				},
				{
					upsert: true,
				},
			);
		} catch (err: any) {
			if (err.code && err.code === 11000) {
				this.logger.debug(
					`Medal ${medalDef.name} already exists for curator ${curator_orcid}`,
				);

				return await this.medalModel.updateOne(
					{
						curator_orcid: curator_orcid,
						resource_id: resource_id,
						name: medalDef.name,
					},
					{
						$inc: {
							count_total: 1,
							score_total: term.score,
						},
					},
				);
			}
			if (err instanceof Error) {
				this.logger.error(err.message, err.stack, err.name);
				throw new Error(
					`An error occured while upserting medal ${medalDef.name} for curator ${curator_orcid} in resource ${resource_id}`,
				);
			}
		}
	}

	async incrementalMedalCompute(report: ReportDocument) {
		const { resource_id, activity_term, league } = report;
		const term = await this.termModel.findOne({
			resource_id: resource_id,
			activity_term: activity_term,
		});

		const concernedMedalDefs = await this.medalDefModel.find({
			list_terms: activity_term,
			resource_id: resource_id,
			league: league,
			first_day: { $lte: report.timestamp },
			last_day: { $gte: report.timestamp },
		});

		const medalupdates$ = concernedMedalDefs.map(async (medalDef) => {
			return await this.upsertMedalForReport(medalDef, report, term);
		});

		await Promise.all(medalupdates$);

		// for each concerned medalDef
		const earningCompute$ = concernedMedalDefs.map(
			async (medalDef: MedalDefDocument) => {
				// get the lowest medal that is earned
				const lowestMedalEarnedList = await this.medalModel
					.find(
						{
							name: medalDef.name,
							resource_id: medalDef.resource_id,
							league: medalDef.league,
						},
						{},
						{ sort: { score_total: -1 } },
					)
					.skip(medalDef.score_relative - 1)
					.limit(1);

				const lowestMedalEarned: MedalDocument = lowestMedalEarnedList[0];

				this.logger.debug(
					`Lowest Medal Earned ${lowestMedalEarned.score_total}`,
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
				const updateHigher = this.medalModel.updateMany(
					{
						name: medalDef.name,
						resource_id: medalDef.resource_id,
						league: medalDef.league,
						score_total: { $gt: lowestMedalEarned.score_total },
					},
					{ $set: { state: AchievementState.achieved } },
				);

				return await Promise.all([updateLower, updateHigher]);
			},
		);

		const updateResults = await Promise.all(earningCompute$);
		updateResults.flat().map((result) => {
			console.log(`Updated ${result.modifiedCount} medals`);
		});
	}
}

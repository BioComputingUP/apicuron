import { Injectable, Logger } from '@nestjs/common';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { FilterQuery, Model } from 'mongoose';
import {
	Report,
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';
import { GetRelatedMedalDefFilter } from '../helpers/helpers';
import { AchievementState, PrivacyType } from '../../core/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ComputeMedalsService } from './compute-medals.service';
import {
	MedalDef,
	MedalDefDocument,
} from '../../core/schemas/achievements-def/medal-def.schema';
import {
	Medal,
	MedalDocument,
} from '../../core/schemas/achievements/medals.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import {
	ResourceMedalsCountUpdatedEvent,
	UserMedalsCountUpdatedEvent,
} from '../events/medal-count-updated.event';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { User, UserDocument } from '../../core/schemas/user.schema';
@Injectable()
export class MedalAggregatorService implements Aggregator {
	constructor(
		@InjectModel(MedalDef.name)
		protected medalDefModel: Model<MedalDefDocument>,
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		@InjectModel(Medal.name) protected medalModel: Model<MedalDocument>,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		protected resourceService: PartnerResourcesService,
		protected computeMedals: ComputeMedalsService,
		protected eventEmitter: EventEmitter2,
	) {}

	logger = new Logger(MedalAggregatorService.name);

	async updateUserPrivacy(curator_orcid: string, privacy: PrivacyType) {
		// update public medals  to the correct privacy
		this.medalModel.updateMany(
			{
				curator_orcid,
				privacy: PrivacyType.public,
			},
			{
				$set: {
					privacy,
				},
			},
		);

		// update private medals to the correct privacy
		// Get related resourceids
		const resourceIds = this.medalModel
			.find({ curator_orcid })
			.distinct('resource_id');
		const resources = await this.resourceService.get_resources({
			resource_id: { $in: resourceIds },
		});
		const privacyUpdates$ = [];
		for (const resource of resources) {
			for (const league of resource.leagues) {
				const update$ = this.medalModel.updateMany(
					{
						curator_orcid,
						resource_id: resource.resource_id,
						privacy: PrivacyType.private,
					},
					{
						$set: {
							privacy: computeAggregatePrivacyField(
								{ privacy: league.visibility },
								{ privacy },
							),
						},
					},
				);
				privacyUpdates$.push(update$);
			}
		}

		await Promise.all(privacyUpdates$);
	}

	private async updateMedalsEarnedState(
		medalDef: MedalDefDocument,
	): Promise<number> {
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

		const updateEarnedPromises$ = earnedMedalsList.map(async (medal, idx) => {
			medal.state = AchievementState.achieved;
			medal.score_relative_index = idx;

			return await medal.save();
		});
		const updateEearned$ = Promise.all(updateEarnedPromises$);

		const [, higherUpdate] = await Promise.all([updateLower, updateEearned$]);

		this.logger.debug(
			`Medal ${medalDef.name} earned by ${higherUpdate.length} curators`,
		);

		return higherUpdate.length;
	}

	private async createOrUpdateMedal(
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

	async applyReport(report: ReportDocument | LeanReportDocument) {
		const term = await this.termModel.findOne({
			resource_id: report.resource_id,
			league: report.league,
			activity_term: report.activity_term,
		});
		const medalDefsFilter = GetRelatedMedalDefFilter(report);

		const affectedMedalDefs = this.medalDefModel
			.find(medalDefsFilter)
			.cursor({ batchSize: 20 });
		const medalDefsUpdated = [];
		for await (const medalDef of affectedMedalDefs) {
			const update$ = this.createOrUpdateMedal(medalDef, report, term);
			medalDefsUpdated.push(update$);
		}
		await Promise.all(medalDefsUpdated);

		await this.eventEmitter.emitAsync(
			UserMedalsCountUpdatedEvent.name,
			new UserMedalsCountUpdatedEvent(
				report.resource_id,
				report.league,
				report.curator_orcid,
			),
		);

		return;
	}

	async applyAllReports(resource_id: string) {
		const medalDefFilter: FilterQuery<BadgeDefDocument> = {
			resource_id,
		};

		await this.computeMedals.computeMedals(medalDefFilter);

		await this.eventEmitter.emitAsync(
			ResourceMedalsCountUpdatedEvent.name,
			new ResourceMedalsCountUpdatedEvent(resource_id),
		);
	}

	async removeAllResourceAggregates(resource_id: string) {
		return await this.medalModel.deleteMany({ resource_id });
	}
}

import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateWriteOpResult } from 'mongoose';
import { getEventSubject } from 'src/core/helpers/events.helper';
import { PrivacyType } from '../../core/enums';
import { EntityCreatedEvent, EntityUpdatedEvent } from '../../core/events';
import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';
import { MedalDef } from '../../core/schemas/achievements-def/medal-def.schema';
import { Medal } from '../../core/schemas/achievements/medals.schema';
import {
	LeanReportDocument,
	Report,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { UserDocument } from '../../core/schemas/user.schema';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';
import { LeagueUpdatedEvent } from '../../resources/partner-resources/leagues/events/league-updated.event';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { computeAggregatePrivacyField } from '../../util/privacy.helper';
import {
	ResourceMedalsCountUpdatedEvent,
	UserMedalsCountUpdatedEvent,
} from '../events/medal-count-updated.event';
import { GetRelatedMedalDefFilter } from '../helpers/helpers';
import { ComputeMedalsService } from './compute-medals.service';
@Injectable()
@AggregatorClass()
export class MedalAggregatorService implements Aggregator {
	constructor(
		@InjectModel(MedalDef.name)
		protected medalDefModel: Model<MedalDef>,
		@InjectModel(Report.name) protected reportModel: Model<Report>,
		@InjectModel(Medal.name) protected medalModel: Model<Medal>,
		@InjectModel(Term.name) protected termModel: Model<Term>,
		protected resourceService: PartnerResourcesService,
		protected computeMedals: ComputeMedalsService,
		protected eventEmitter: EventEmitter2,
	) {}

	logger = new Logger(MedalAggregatorService.name);

	async recomputeAllResourceAggregates(resource_id: string) {
		await this.removeAllResourceAggregates(resource_id);
		await this.applyAllReports(resource_id);
	}

	async updatedLeague(leagueUpdated: LeagueUpdatedEvent): Promise<number> {
		if (!leagueUpdated.privacyChanged()) {
			return 0;
		}

		const newPrivacy = leagueUpdated.newValue.visibility;
		const filter = {
			resource_id: leagueUpdated.resource.resource_id,
			league: leagueUpdated.newValue.name,
		};

		const medalDefUpdate$ = this.medalDefModel.updateMany(filter, {
			$set: {
				privacy: newPrivacy,
			},
		});

		const medalUpdate$ = this.medalModel.updateMany(filter, {
			$set: {
				privacy: newPrivacy,
			},
		});

		const [medalDefUpdate, medalUpdate] = await Promise.all([
			medalDefUpdate$,
			medalUpdate$,
		]);

		return medalDefUpdate.modifiedCount + medalUpdate.modifiedCount;
	}

	async deleteLeague(resource_id: string, league: string): Promise<number> {
		const filter = {
			resource_id,
			league,
		};
		const medalDefDelete$ = this.medalDefModel.deleteMany(filter);
		const medalDelete$ = this.medalModel.deleteMany(filter);

		const [medalDefDelete, medalDelete] = await Promise.all([
			medalDefDelete$,
			medalDelete$,
		]);

		return medalDefDelete.deletedCount + medalDelete.deletedCount;
	}

	async updatedUser(
		event: EntityCreatedEvent<UserDocument> | EntityUpdatedEvent<UserDocument>,
	) {
		const user = getEventSubject(event);
		const { orcid_id: curator_orcid, privacy } = user;
		// update public medals  to the correct privacy
		await this.medalModel.updateMany(
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
		const privacyUpdates$: Promise<UpdateWriteOpResult>[] = [];
		for (const resource of resources) {
			for (const league of resource.leagues) {
				const update$ = this.medalModel
					.updateMany(
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
					)
					.exec();
				privacyUpdates$.push(update$);
			}
		}

		await Promise.all(privacyUpdates$);
	}

	async applyReport(
		report: ReportDocument | LeanReportDocument,
		termDoc: TermDocument,
		_resource: PartnerResourceDocument,
		_curator?: UserDocument,
	) {
		const term =
			termDoc ??
			(await this.termModel.findOne({
				resource_id: report.resource_id,
				league: report.league,
				activity_term: report.activity_term,
			}));
		const medalDefsFilter = GetRelatedMedalDefFilter(report);

		const affectedMedalDefs = this.medalDefModel
			.find(medalDefsFilter)
			.cursor({ batchSize: 20 });
		const medalDefsUpdated: Promise<number>[] = [];
		for await (const medalDef of affectedMedalDefs) {
			const update$ = this.computeMedals.createOrUpdateMedal(
				medalDef,
				report,
				term,
			);
			medalDefsUpdated.push(update$);
		}
		await Promise.all(medalDefsUpdated);

		if (medalDefsUpdated.length == 0) {
			return;
		}

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
		await this.medalModel.deleteMany({ resource_id });
	}

	async termUpdated(oldTerm: TermDocument, newTerm: TermDocument) {
		if (oldTerm.score == newTerm.score) {
			return;
		}
		await this.computeMedals.reComputeMedals({
			resource_id: newTerm.resource_id,
			league: newTerm.league,
			activity_term: newTerm.activity_term,
		});
		await this.medalDefModel.updateMany(
			{
				resource_id: newTerm.resource_id,
				league: newTerm.league,
				activity_term: newTerm.activity_term,
			},
			{
				$pull: { list_terms: newTerm.activity_term },
			},
		);
	}

	async termDeleted(term: TermDocument) {
		// retrieve the list of medal definitions that are affected by the term deletion
		const affectedMedalDefs = await this.medalDefModel.find(
			{
				resource_id: term.resource_id,
				league: term.league,
				list_terms: term.activity_term,
			},
			{ _id: 1 },
		);

		if (affectedMedalDefs.length === 0) {
			return;
		}

		// extract the ids of the affected medals
		const affectedIds = affectedMedalDefs.map((medalDef) => medalDef._id);

		// remove the term from the list of terms in the medal definitions
		await this.medalDefModel.updateMany(
			{
				resource_id: term.resource_id,
				league: term.league,
				list_terms: term.activity_term,
			},
			{
				$pull: { list_terms: term.activity_term },
			},
		);

		// recompute the medals that are affected by the term deletion
		await this.computeMedals.reComputeMedals({ _id: { $in: affectedIds } });
	}
	updatedResource(_after: PartnerResource): Promise<void> {
		return; // medals have no reference to the resource
	}
}

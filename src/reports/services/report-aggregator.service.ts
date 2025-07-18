import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
	Document,
	FilterQuery,
	Model,
	Types,
	UpdateWriteOpResult,
} from 'mongoose';
import { getEventSubject } from 'src/core/helpers/events.helper';
import { LeagueUpdatedEvent } from 'src/resources/partner-resources/leagues/events/league-updated.event';
import { PrivacyType } from '../../core/enums';
import {
	UserCreatedEvent,
	UserRepository,
	UserUpdatedEvent,
} from '../../core/repositories/user.repository';
import {
	League,
	PartnerResource,
	PartnerResourceDocument,
	ResourceStats,
	Term,
	TermDocument,
} from '../../core/schemas';
import {
	LeanReportDocument,
	Report,
	ReportDocument,
	ReportDocumentOverride,
	ReportModel,
} from '../../core/schemas/reports.schema';
import { User, UserDocumentOverride } from '../../core/schemas/user.schema';
import { AggregatorClass } from '../../event-orchestrator/decorators/aggregator.decorator';
import { Aggregator } from '../../event-orchestrator/interfaces/aggregator.interface';

@Injectable()
@AggregatorClass()
export class ReportAggregatorService implements Aggregator {
	constructor(
		@InjectModel(Report.name) protected reportModel: ReportModel,
		protected userRepository: UserRepository,
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		@InjectModel(Term.name)
		protected termModel: Model<TermDocument>,
	) {}
	logger = new Logger(ReportAggregatorService.name);

	private async updateReportsPrivacy(filter: FilterQuery<ReportDocument> = {}) {
		const update$ = this.reportModel.updateMany(
			{
				$and: [
					{
						$or: [
							{
								'user.privacy': PrivacyType.private,
							},
							{
								'league_data.visibility': PrivacyType.private,
							},
						],
					},
					filter,
				],
			},
			{
				$set: {
					privacy: PrivacyType.private,
				},
			},
		);

		const updatePublic$ = this.reportModel.updateMany(
			{
				$and: [
					{
						'user.privacy': PrivacyType.public,
						'league_data.visibility': PrivacyType.public,
					},
					filter,
				],
			},
			{
				$set: { privacy: PrivacyType.public },
			},
		);
		const [privateResult, publicResult] = await Promise.all([
			update$,
			updatePublic$,
		]);
		return privateResult.modifiedCount + publicResult.modifiedCount;
	}
	async updatedUser(event: UserCreatedEvent | UserUpdatedEvent) {
		const user = getEventSubject(event);
		await this.reportModel.updateMany(
			{ curator_orcid: user.orcid_id },
			{ $set: { user } },
		);

		await this.updateReportsPrivacy({ curator_orcid: user.orcid_id });

		return;
	}
	async deleteLeague(resource_id: string, league: string) {
		const { deletedCount } = await this.reportModel.deleteMany({
			resource_id,
			league,
		});
		return deletedCount;
	}
	async updatedLeague(leagueUpdated: LeagueUpdatedEvent) {
		let count = 0;
		const { modifiedCount } = await this.reportModel.updateMany(
			{
				resource_id: leagueUpdated.resource.resource_id,
				league: leagueUpdated.newValue.resource_id,
			},
			{
				$set: {
					league_data: leagueUpdated.resource,
				},
			},
		);
		count += modifiedCount;
		if (leagueUpdated.privacyChanged()) {
			count += await this.updateReportsPrivacy({
				resource_id: leagueUpdated.resource.resource_id,
				league: leagueUpdated.newValue.name,
			});
		}
		return count;
	}
	async recomputeAllResourceAggregates(resource_id: string): Promise<void> {
		const resource = await this.resourceModel.findOne({ resource_id });
		if (!resource) {
			this.logger.error(
				`Resource with id ${resource_id} not found while recomputing aggregates`,
			);
			throw new Error(`Resource with id ${resource_id} not found`);
		}

		this.logger.debug(
			`Assinging resource ${resource.resource_name} to all relevant reports`,
		);
		// Update the resource
		const updates$: Promise<UpdateWriteOpResult>[] = [];
		const resourceUpdate$ = this.reportModel.updateMany(
			{ resource_id },
			{ $set: { resource } },
		);
		updates$.push(resourceUpdate$.exec());

		const leagues = resource.leagues;
		for (const league of leagues) {
			// Update all reports
			const leagueUpdate$ = this.reportModel.updateMany(
				{ resource_id, league: league.name },
				{ $set: { league_data: league } },
			);
			updates$.push(leagueUpdate$.exec());
		}
		await Promise.all(updates$);

		this.logger.debug(
			`Updating the user attribute for all users in resource ${resource.resource_name} to all relevant reports`,
		);
		// Update all users
		const orcidIds = await this.reportModel.distinct<string>('curator_orcid', {
			resource_id,
		});
		const userUpdates$: Promise<UpdateWriteOpResult>[] = [];
		for (const curator_orcid of orcidIds) {
			const user = await this.userRepository.findOne({
				orcid_id: curator_orcid,
			});
			const update$ = this.reportModel.updateMany(
				{ resource_id, curator_orcid },
				{ $set: { user } },
			);
			userUpdates$.push(update$.exec());
		}
		await Promise.all(userUpdates$);

		this.logger.debug(
			`Updating the term attribute for all activities in resource ${resource.resource_name} to all relevant reports`,
		);

		// update all terms
		const terms = await this.termModel.find({ resource_id });

		const termUpdates$: Promise<UpdateWriteOpResult>[] = [];
		for (const term of terms) {
			const update$ = this.reportModel.updateMany(
				{ activity_term: term.activity_term, resource_id },
				{ $set: { term } },
			);
			termUpdates$.push(update$.exec());
		}

		await Promise.all(termUpdates$);
	}
	async termUpdated(oldTerm: TermDocument, term: TermDocument) {
		await this.reportModel.updateMany(
			{
				resource_id: oldTerm.resource_id,
				activity_term: oldTerm.activity_term,
			},
			{ $set: { term: term } },
		);
	}
	async termDeleted(term: TermDocument) {
		await this.reportModel.deleteMany({
			activity_term: term.activity_term,
			resource_id: term.resource_id,
		});
	}
	async updatedResource(resource: PartnerResource): Promise<void> {
		this.logger.debug(`received resource with this logo: ${resource.logo}`);
		await this.reportModel.updateMany(
			{ resource_id: resource.resource_id },
			{ $set: { resource: resource } },
		);
	}

	async applyReport(
		_report:
			| (Document<unknown, unknown, Report> &
					Omit<Report & { _id: Types.ObjectId }, keyof ReportDocumentOverride> &
					ReportDocumentOverride)
			| LeanReportDocument,
		_term: Document<unknown, unknown, Term> &
			Omit<Term & { _id: Types.ObjectId }, never>,
		_resource: Document<unknown, unknown, PartnerResource> &
			Omit<
				PartnerResource & { _id: Types.ObjectId },
				keyof {
					leagues: Types.DocumentArray<League>;
					stats: Types.Subdocument<Types.ObjectId> & ResourceStats;
				}
			> & {
				leagues: Types.DocumentArray<League>;
				stats: Types.Subdocument<Types.ObjectId> & ResourceStats;
			},
		_curator?:
			| (Document<unknown, unknown, User> &
					Omit<User & { _id: Types.ObjectId }, keyof UserDocumentOverride> &
					UserDocumentOverride)
			| undefined,
	): Promise<void> {
		return;
	}
	applyAllReports(_resource_id: string): void | Promise<void> {
		return;
	}
	removeAllResourceAggregates(_resource_id: string): void | Promise<void> {
		return;
	}
}

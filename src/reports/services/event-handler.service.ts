import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Query, UpdateWriteOpResult } from 'mongoose';
import { UserPrivacyUpdatedEvent } from '../../auth/users/events/update-privacy';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import { LeagueDeletedEvent } from '../../resources/partner-resources/leagues/events/league-deleted-event';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import { computePrivacyField } from '../../util/privacy.helper';

@Injectable()
export class ReportEventsHandlerService {
	constructor(
		@InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
		protected resourcesService: PartnerResourcesService,
	) {}

	/**
	 * Updates the privacy settings of reports for a given user.
	 *
	 * @param user - The user for whom the reports' privacy settings will be updated.
	 */
	@OnEvent(UserPrivacyUpdatedEvent.name, { async: true, promisify: true })
	async updateReportsPrivacy({ user }: UserPrivacyUpdatedEvent) {
		// first we retrieve all the resource_ids concerned by this change
		const resourceIdList = (await this.reportModel
			.aggregate()
			.match({ curator_orcid: user.orcid_id })
			.group({
				_id: '$resource_id',
				resource_id: { $first: '$resource_id' },
			})) as { _id: string; resource_id: string }[];

		const resourceIds = resourceIdList.map((resource) => resource.resource_id);

		// Retrieve the resources associated with the resource IDs
		const resources = await this.resourcesService.get_resources({
			resource_id: { $in: resourceIds },
		});

		// Get the leagues associated with the resources
		const resourceLeagues = resources
			.map((resource) => this.resourcesService.getResourceLeagues(resource))
			.flat();

		const updatePromises$: Query<UpdateWriteOpResult, ReportDocument>[] = [];
		for (const [resource, league] of resourceLeagues) {
			// Update the privacy field of reports that match the specified criteria
			const updatePromise$ = this.reportModel.updateMany(
				{
					curator_orcid: user.orcid_id,
					resource_id: resource.resource_id,
					league: league.name,
				},
				{
					$set: {
						privacy: computePrivacyField(resource, user, {
							league: league.name,
						}),
					},
				},
			);
			updatePromises$.push(updatePromise$);
		}

		// Wait for all update promises to resolve
		await Promise.all(updatePromises$);

		return;
	}

	@OnEvent(LeagueDeletedEvent.name, { async: true, promisify: true })
	async leagueDeletedHandler(
		leagueDeleted: LeagueDeletedEvent,
	): Promise<number> {
		const deleted = await this.reportModel.deleteMany({
			resource_id: leagueDeleted.resource_id,
			league: leagueDeleted.name,
		});

		return deleted.deletedCount;
	}
}

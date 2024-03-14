import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ComputeMedalsService } from './compute-medals.service';
import { ComputeBadgesService } from './compute-badges.service';
import { FilterQuery } from 'mongoose';
import { ReportDocument } from '../../core/schemas/reports.schema';
import { MedalDefDocument } from '../../core/schemas/achievements-def/medal-def.schema';
import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';

@Injectable()
export class ComputeAchievementsService {
	constructor(
		protected computeMedals: ComputeMedalsService,
		protected computeBadges: ComputeBadgesService,
		protected eventEmitter: EventEmitter2,
	) {}

	logger = new Logger(ComputeAchievementsService.name);

	public async computeUserAchievements({
		user,
		resource,
	}: {
		user: { orcid_id: string };
		resource: { resource_id: string };
	}) {
		const computeResults = await Promise.all([
			this.computeBadges.computeUserBadges({ user, resource }),
			this.computeMedals.computeResourceMedals(resource),
		]);

		return computeResults;
	}

	public async computeResourceAchievements(resource: { resource_id: string }) {
		const computeResults = await Promise.all([
			this.computeMedals.computeResourceMedals(resource),
			this.computeBadges.computeResourceBadges(resource),
		]);

		return computeResults;
	}

	public async computeAchievements(
		achFilter: FilterQuery<MedalDefDocument> & FilterQuery<BadgeDefDocument>,
	) {
		const computeResults = await Promise.all([
			this.computeMedals.computeMedals(achFilter),
			this.computeBadges.computeBadges(achFilter),
		]);

		return computeResults;
	}
}

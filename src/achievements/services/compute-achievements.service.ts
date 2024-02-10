import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	ON_COMPUTE_RESOURCE_ACHIEVEMENTS,
	ON_COMPUTE_USER_ACHIEVEMENTS,
} from '../constants';
import { ComputeMedalsService } from './compute-medals.service';
import { ComputeBadgesService } from './compute-badges.service';

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

		await this.eventEmitter.emitAsync(ON_COMPUTE_USER_ACHIEVEMENTS, {
			user,
			resource,
		});

		return computeResults;
	}

	public async computeResourceAchievements(resource: { resource_id: string }) {
		const computeResults = await Promise.all([
			this.computeMedals.computeResourceMedals(resource),
			this.computeBadges.computeResourceBadges(resource),
		]);

		await this.eventEmitter.emitAsync(ON_COMPUTE_RESOURCE_ACHIEVEMENTS, {
			resource,
		});

		return computeResults;
	}

	// event handling

	// @OnEvent(ON_TERM_UPDATED, { async: true })
	// async on_term_updated(term: UpdateTermDto) {
	// 	const { resource_id } = term;
	// 	return await this.computeResourceAchievements({ resource_id });
	// }

	// @OnEvent(ON_TERM_DELETED, { async: true })
	// async on_term_deleted(termDelete: DeleteTermDto) {
	// 	const { resource_id } = termDelete;
	// 	return await this.computeResourceAchievements({ resource_id });
	// }

	// @OnEvent(ON_BADGE_DEF_UPDATE, { async: true })
	// async on_badge_def_update(badge: Badge) {
	// 	const { resource_id } = badge;
	// 	return await this.computeResourceAchievements({ resource_id });
	// }

	// @OnEvent(ON_BADGE_DEF_DELETE, { async: true })
	// async on_badge_def_delete(deleteBadgeDef: DeleteBadgeDefDto) {
	// 	const { resource_id } = deleteBadgeDef;
	// 	return await this.computeResourceAchievements({ resource_id });
	// }

	// @OnEvent(ON_MEDAL_DEF_UPDATE, { async: true })
	// async on_medal_def_update(medalDef: Medal) {
	// 	const { resource_id } = medalDef;
	// 	return await this.computeResourceAchievements({ resource_id });
	// }

	// @OnEvent(ON_MEDAL_DEF_DELETE, { async: true })
	// async onTermUpdate(deleteMedalDef: DeleteMedalDefDto) {
	// 	const { resource_id } = deleteMedalDef;
	// 	return await this.computeResourceAchievements({ resource_id });
	// }

	// @OnEvent(POST_REPORT_INSERT, { async: true })
	// async onReportInsert(report: ReportDto) {
	// 	const { resource_id, curator_orcid } = report;
	// 	return await this.computeUserAchievements({
	// 		user: { orcid_id: curator_orcid },
	// 		resource: { resource_id },
	// 	});
	// }

	// @OnEvent(POST_REPORT_INSERT_MANY, { async: true })
	// async onReportsInsert(reports: Report[]) {
	// 	const resource_ids = _.uniq(reports.map(({ resource_id }) => resource_id));

	// 	const computeAchievementsPromises$ = resource_ids.map(
	// 		async (resource_id) => {
	// 			return await this.computeResourceAchievements({ resource_id });
	// 		},
	// 	);

	// 	return await Promise.all(computeAchievementsPromises$);
	// }
}

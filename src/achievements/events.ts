import { FilterQuery } from 'mongoose';
import { BadgeDefDocument } from '../core/schemas/achievements-def/badge-def.schema';
import { ReportDocument } from '../core/schemas/reports.schema';

export const onComputeManyBadges = 'on.compute.badges.many';
export interface IComputeBadgeManyEventPayload {
	badgeDefFilter: FilterQuery<BadgeDefDocument>;
	reportFilter: FilterQuery<ReportDocument>;
}

export const onComputeResourceBadges = 'on.compute.badges.resource';
export interface IComputeResourceBadgesEventPayload {
	resource_id: string;
}

export const onComputeUserBadges = 'on.compute.badges.user';
export interface IComputeUserBadgesEventPayload {
	resource_id: string;
	curator_orcid: string;
}

export const onIncrementalBadgeCompute = 'on.compute.badges.incremental';
export interface IincrementalBadgeComputeEventPayload {
	resource_id: string;
	curator_orcid: string;
}

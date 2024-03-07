import { FilterQuery } from 'mongoose';
import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';
import { MedalDefDocument } from '../../core/schemas/achievements-def/medal-def.schema';
import { DeleteBadgeDefDto } from '../dto/badge-crud.dto';
import { DeleteMedalDefDto } from '../dto/medal-crud.dto';
import { ReportDocument } from '../../core/schemas/reports.schema';

// Define event name for badge definition deletion
export const onBadgeDefDelete = 'on.badgedef.delete';
// Define payload interface for badge definition deletion event
export interface IBadgeDefDeleteEventPayload {
	badgeDef: DeleteBadgeDefDto;
}

// Define event name for badge definition update
export const onBadgeDefUpdate = 'on.badgedef.update';
// Define payload interface for badge definition update event
export interface IBadgeDefUpdateEventPayload {
	badgeDef: BadgeDefDocument;
}

// Define event name for badge definition creation
export const onBadgeDefCreate = 'on.badgedef.create';

// Define payload interface for badge definition creation event
export interface IBadgeDefCreateEventPayload {
	badgeDef: BadgeDefDocument;
}

// Define event name for medal definition deletion
export const onMedalDefDelete = 'on.medaldef.delete';
// Define payload interface for medal definition deletion event
export interface IMedalDefDeleteEventPayload {
	medalDef: DeleteMedalDefDto;
}

// Define event name for medal definition update
export const onMedalDefUpdate = 'on.medaldef.update';
// Define payload interface for medal definition update event
export interface IMedalDefUpdateEventPayload {
	medalDef: MedalDefDocument;
}

// Define event name for medal definition creation
export const onMedalDefCreate = 'on.medaldef.create';
// Define payload interface for medal definition creation event
export interface IMedalDefCreateEventPayload {
	medalDef: MedalDefDocument;
}

export const onBadgesCompute = 'on.badge.count.change';
export type IBadgeCountChangeEventPayload = FilterQuery<BadgeDefDocument>;

export const onMedalsCompute = 'on.medal.count.change';
export type IMedalCountChangeEventPayload = FilterQuery<MedalDefDocument>;

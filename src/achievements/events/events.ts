import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';
import { MedalDefDocument } from '../../core/schemas/achievements-def/medal-def.schema';
import { DeleteBadgeDefDto } from '../dto/badge-crud.dto';
import { DeleteMedalDefDto } from '../dto/medal-crud.dto';

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

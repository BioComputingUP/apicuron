import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';

export class BadgeDefUpdatedEvent {
	constructor(public badgeDef: BadgeDefDocument) {}
}

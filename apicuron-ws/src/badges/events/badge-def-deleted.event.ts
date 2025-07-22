import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';

export class BadgeDefDeletedEvent {
	constructor(public badgeDef: BadgeDefDocument) {}
}

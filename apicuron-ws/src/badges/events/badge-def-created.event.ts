import { BadgeDefDocument } from '../../core/schemas/achievements-def/badge-def.schema';

export class BadgeDefCreatedEvent {
	constructor(public badgeDef: BadgeDefDocument) {}
}

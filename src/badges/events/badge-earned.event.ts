import { BadgeDocument } from '../../core/schemas/achievements/badges.schema';

export class BadgeEarnedEvent {
	constructor(public readonly badge: BadgeDocument) {}
}

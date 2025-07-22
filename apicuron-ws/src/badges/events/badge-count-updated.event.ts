export class ResourceBadgesUpdatedEvent {
	constructor(public readonly resource_id: string) {}
}

export class UserBadgesUpdatedEvent {
	constructor(
		public readonly resource_id: string,
		public readonly league: string,
		public readonly curator_orcid: string,
	) {}
}

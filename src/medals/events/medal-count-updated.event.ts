export class ResourceMedalsCountUpdatedEvent {
	constructor(
		public readonly resource_id: string,
	) {}
}

export class UserMedalsCountUpdatedEvent {
	constructor(
		public readonly resource_id: string,
		public readonly league: string,
		public readonly curator_orcid: string,
	) {}
}

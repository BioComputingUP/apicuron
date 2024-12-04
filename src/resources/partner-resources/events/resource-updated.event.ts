import { PartnerResourceDocument } from '../../../core/schemas';

export class PartnerResourceUpdatedEvent {
	constructor(
		public readonly oldResource: PartnerResourceDocument,
		public readonly newResource: PartnerResourceDocument,
		public readonly date: Date = new Date(),
	) {}
}

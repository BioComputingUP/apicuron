import { PartnerResourceDocument } from '../../../core/schemas';

export class PartnerResourceUpdatedEvent {
	constructor(public readonly partnerResource: PartnerResourceDocument) {}
}

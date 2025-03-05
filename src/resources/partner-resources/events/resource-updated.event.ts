import { PartnerResourceDocument } from '../../../core/schemas';
import { PartnerResourceEntity } from '../../dto/partner-resources.entity';

export class PartnerResourceUpdatedEvent {
	constructor(
		public readonly oldResource: PartnerResourceEntity,
		public readonly newResource: PartnerResourceEntity,
		public readonly date: Date = new Date(),
	) {}
}

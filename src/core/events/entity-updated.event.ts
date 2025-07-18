import { HydratedDocument } from 'mongoose';

export class EntityUpdatedEvent<Entity> {
	constructor(
		public readonly identifier: string,
		public readonly before: Entity,
		public readonly after: Entity,
		public readonly timestamp: Date,
	) {}
}

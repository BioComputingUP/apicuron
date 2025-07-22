import { HydratedDocument } from 'mongoose';

export class EntityCreatedEvent<Entity> {
	constructor(
		public readonly identifier: string,
		public readonly instance: Entity,
		public readonly timestamp: Date,
	) {}
}

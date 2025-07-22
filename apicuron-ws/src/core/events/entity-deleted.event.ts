import { HydratedDocument } from 'mongoose';

export class EntityDeletedEvent<Entity> {
	constructor(
		public readonly identifier: string,
		public readonly before: Entity,
		public readonly timestamp: Date,
	) {}
}

import { Model, Document } from 'mongoose';
import { EntityEvent } from './abstract-entity.event';

export class EntityDeletedEvent<T extends Document> extends EntityEvent<T> {
	name: string;
	constructor(
		public readonly model: Model<T>,
		public readonly identifier: string,
		public readonly before: T,
		public readonly timestamp: Date,
	) {
		super(model, timestamp);
	}
}

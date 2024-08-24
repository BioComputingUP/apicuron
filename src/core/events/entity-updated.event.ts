import { Document, Model } from 'mongoose';
import { EntityEvent } from './abstract-entity.event';

export class EntityUpdatedEvent<T extends Document> extends EntityEvent<T> {
	public name: string;
	constructor(
		public readonly model: Model<T>,
		public readonly identifier: string,
		public readonly before: T,
		public readonly after: T,
		public readonly timestamp: Date,
	) {
		super(model, timestamp);
	}
}

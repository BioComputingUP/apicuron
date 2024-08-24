import { Document, Model } from 'mongoose';
import { EntityEvent } from './abstract-entity.event';

export class EntityCreated<T extends Document> extends EntityEvent<T> {
	constructor(
		public readonly model: Model<T>,
		public readonly identifier: string,
		public readonly instance: T,
		public readonly timestamp: Date,
	) {
		super(model, timestamp);
	}
}

import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { EntityEvent } from './abstract-entity.event';

export class MassEntityUpdated<T extends Document> extends EntityEvent<T> {
	name: string;
	constructor(
		public readonly model: Model<T>,
		public readonly query: FilterQuery<T>,
		public readonly update: UpdateQuery<T>,
		public readonly timestamp: Date,
	) {
		super(model, timestamp);
	}
}

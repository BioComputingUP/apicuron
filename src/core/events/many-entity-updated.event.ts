import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { EntityEvent } from './abstract-entity.event';
import { EntityRepository } from '../repositories/entity-repository';

export class ManyEntityUpdated<T extends Document> extends EntityEvent<T> {
	eventName: string;
	constructor(
		public readonly model: Model<T>,
		public readonly Repository: typeof EntityRepository,
		public readonly query: FilterQuery<T>,
		public readonly update: UpdateQuery<T>,
		public readonly timestamp: Date,
	) {
		super(model, Repository, timestamp);
	}
}

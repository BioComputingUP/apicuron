import { Model, Document } from 'mongoose';
import { EntityEvent } from './abstract-entity.event';
import { EntityRepository } from '../repositories/entity-repository';

export class EntityDeletedEvent<T extends Document> extends EntityEvent<T> {
	eventName: string;
	constructor(
		public readonly model: Model<T>,
		public readonly Repository: typeof EntityRepository,
		public readonly identifier: string,
		public readonly before: T,
		public readonly timestamp: Date,
	) {
		super(model, Repository, timestamp);
	}
}

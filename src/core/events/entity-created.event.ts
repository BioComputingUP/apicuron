import { Document, Model } from 'mongoose';
import { EntityEvent } from './abstract-entity.event';
import { EntityRepository } from '../repositories/entity-repository';

export class EntityCreatedEvent<T extends Document> extends EntityEvent<T> {
	constructor(
		public readonly model: Model<T>,
		public readonly Repository: typeof EntityRepository,

		public readonly identifier: string,
		public readonly instance: T,
		public readonly timestamp: Date,
	) {
		super(model, Repository, timestamp);
	}
}

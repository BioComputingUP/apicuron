import { getModelToken } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { EntityRepository } from '../repositories/entity-repository';
import { Type } from '@nestjs/common';

export abstract class EntityEvent<T extends Document> {
	public eventName: string;
	constructor(
		public readonly model: Model<T>,
		public readonly Repository: typeof EntityRepository,
		public readonly timestamp: Date,
	) {
		this.eventName = (this.constructor as typeof EntityEvent).getModelEventName(
			this.Repository,
		);
	}
	public static getModelEventName(repo: any): string {
		// const [modelName, connectionName] = [, model.db.name];
		return `${repo.name}${this.name}`;
	}
}

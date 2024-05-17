import { Document } from 'mongoose';

export class EntityCreated<T extends Document> {
	name: string;
	constructor(
		public readonly model: string,
		public readonly identifier: string,
		public readonly instance: T,
		public readonly timestamp: Date,
	) {
		this.name = EntityCreated.getModelEventName(model);
	}
	static getModelEventName(modelName: string): string {
		return `${modelName}CreatedEvent`;
	}
}

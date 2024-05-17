import { Document } from 'mongoose';

export class EntityUpdatedEvent<T extends Document> {
	public name: string;
	constructor(
		public readonly model: string,
		public readonly identifier: string,
		public readonly before: T,
		public readonly after: T,
		public readonly timestamp: Date,
	) {
		this.name = EntityUpdatedEvent.getModelEventName(model);
	}

	static getModelEventName(modelName: string): string {
		return `${modelName}UpdatedEvent`;
	}
}

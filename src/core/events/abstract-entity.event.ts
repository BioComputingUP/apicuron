import { getModelToken } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';

export abstract class EntityEvent<T extends Document> {
	name: string;
	constructor(
		public readonly model: Model<T>,
		public readonly timestamp: Date,
	) {
		this.name = (this.constructor as typeof EntityEvent).getModelEventName(
			this.model,
		);
	}
	static getModelEventName<T extends Document>(model: Model<T>): string {
		const [modelName, connectionName] = [model.modelName, model.db.name];
		return `${connectionName}.${getModelToken(modelName)}.created`;
	}
}

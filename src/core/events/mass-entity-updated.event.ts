import { Document, FilterQuery, UpdateQuery } from 'mongoose';

export class MassEntityUpdated<T extends Document> {
	name: string;
	constructor(
		public readonly model: string,
		public readonly query: FilterQuery<T>,
		public readonly update: UpdateQuery<T>,
		public readonly timestamp: Date,
	) {
		this.name = `${model}MassUpdatedEvent`;
	}
}

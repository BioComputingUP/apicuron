import { FilterQuery, UpdateQuery } from "mongoose";

export class ManyEntityUpdated<Entity> {
	constructor(
		public readonly query: FilterQuery<Entity>,
		public readonly update: UpdateQuery<Entity>,
		public readonly timestamp: Date,
	) {}
}

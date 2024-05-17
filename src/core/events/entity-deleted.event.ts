export class EntityDeletedEvent<T> {
	name: string;
	constructor(
		public readonly model: string,
		public readonly identifier: string,
		public readonly before: T,
		public readonly timestamp: Date,
	) {
		this.name = EntityDeletedEvent.getModelEventName(model);
	}

	static getModelEventName(model: string): string {
		return `${model}DeletedEvent`;
	}
}

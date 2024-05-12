import mongoose, {
	Document,
	FilterQuery,
	Model,
	ProjectionType,
	QueryOptions,
	UpdateQuery,
	UpdateWithAggregationPipeline,
} from 'mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';

export abstract class EntityRepository<T extends Document> {
	constructor(private readonly model: Model<T>) {}

	async deleteById(id: string): Promise<T> {
		return this.model.findByIdAndDelete(id);
	}

	async deleteOne(
		filter: FilterQuery<T>,
		options?: QueryOptions<T>,
	): Promise<T> {
		return await this.model.findOneAndDelete(filter, options);
	}

	async deleteMany(
		filter: FilterQuery<T>,
		options?: QueryOptions<T>,
	): Promise<DeleteResult> {
		return await this.model.deleteMany(filter, options);
	}

	async updateMany(
		filter: FilterQuery<T>,
		update: UpdateWithAggregationPipeline | UpdateQuery<T>,
		options?: QueryOptions<T>,
	): Promise<UpdateResult> {
		return await this.model.updateMany(filter, update, options);
	}

	async updateOne(
		filter: FilterQuery<T>,
		update: UpdateQuery<T>,
		options?: QueryOptions<T>,
	): Promise<UpdateResult> {
		return await this.model.updateOne(filter, update, options);
	}

	async findById(id: string): Promise<T> {
		return this.model.findById(id);
	}

	async find(
		filter: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T[] | T> {
		return await this.model.find(filter, projection, options);
	}

	async *findAndIterate(
		filter: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): AsyncGenerator<T, any, any> {
		const cursor = this.model.find(filter, projection, options).cursor(options);
		for await (const entry of cursor) {
			yield entry;
		}
	}

	async findOne(
		filter: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T> {
		return await this.model.findOne(filter, projection, options);
	}

	async count(
		filter: FilterQuery<T>,
		options?: QueryOptions<T>,
	): Promise<number> {
		return await this.model.countDocuments(filter, options);
	}

	async create(entity: T): Promise<T> {
		return this.model.create(entity);
	}
}

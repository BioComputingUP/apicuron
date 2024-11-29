import {
	Aggregate,
	AggregateOptions,
	AnyObject,
	Document,
	FilterQuery,
	HydratedDocument,
	LeanDocument,
	Model,
	ObjectId as ObjectIdType,
	PipelineStage,
	ProjectionType,
	Query,
	QueryOptions,
	UpdateQuery,
	UpdateWithAggregationPipeline,
} from 'mongoose';
import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	EntityDeletedEvent,
	ManyEntityUpdated,
	EntityUpdatedEvent,
	EntityCreatedEvent,
} from '../events';
import { Logger } from '@nestjs/common';

export abstract class EntityRepository<T extends Document> {
	constructor(
		protected readonly model: Model<T>,
		protected readonly eventEmitter: EventEmitter2,
	) {}

	private static getRepository() {
		return this;
	}

	private logger = new Logger(EntityRepository.name);

	/**
	 * Creates a new document instance of the model.
	 *
	 * @param doc - An optional partial document to initialize the new document with.
	 * @param fields - Optional fields to include in the new document.
	 * @param options - Optional settings for the document creation. Can be a boolean or an object.
	 * @returns A new instance of the model.
	 */
	public newDocument(
		doc?: Partial<LeanDocument<T>> | null,
		fields?: any | null,
		options?: boolean | AnyObject,
	): T {
		const instance = new this.model(doc, fields, options);

		const ogSave = instance.save;

		instance.save = async (...options): Promise<HydratedDocument<T>> => {
			this.logger.warn(`Avoid using save method, perform query instead !`);
			return await ogSave.call(instance, options);

			// if (instance.isNew) {
			// 	const response = await ogSave.call(instance, options);
			// 	const event = new EntityCreated(
			// 		this.model,
			// 		instance._id.toString(),
			// 		instance,
			// 		new Date(),
			// 	);
			// 	await this.eventEmitter.emitAsync(event.eventName, event);
			// 	return response;
			// }

			// return;
		};

		return instance;
	}

	/**
	 * Deletes a document from the database by its ID.
	 *
	 * @param id - The ID of the document to delete.
	 * @returns A Promise that resolves to the deleted document.
	 */
	async deleteById(id: string): Promise<T> {
		const doc = await this.model.findByIdAndDelete(id);

		const event = new EntityDeletedEvent(
			this.model,
			Object.getPrototypeOf(this),
			id,
			doc,
			new Date(),
		);
		await this.eventEmitter.emitAsync(event.eventName, event);
		return doc;
	}

	/**
	 * Deletes a single document from the collection based on the provided filter.
	 *
	 * @param filter - The filter to apply when searching for the document to delete.
	 * @param options - Optional query options.
	 * @returns A promise that resolves to the deleted document.
	 */
	async deleteOne(
		filter: FilterQuery<T>,
		options?: QueryOptions<T>,
	): Promise<T> {
		const doc = await this.model.findOneAndDelete(filter, options);
		const event = new EntityDeletedEvent(
			this.model,
			Object.getPrototypeOf(this),
			doc._id.toString(),
			doc,
			new Date(),
		);
		this.eventEmitter.emit(event.eventName, event);
		return doc;
	}

	/**
	 * Deletes multiple documents from the collection that match the given filter.
	 *
	 * @param filter - The filter to apply when deleting documents.
	 * @param options - The options to use when executing the delete operation.
	 * @returns A promise that resolves to the delete result.
	 */
	async deleteMany(
		filter: FilterQuery<T>,
		options?: QueryOptions<T>,
	): Promise<DeleteResult> {
		return await this.model.deleteMany(filter, options);
	}

	/**
	 * Updates multiple documents in the collection that match the given filter.
	 *
	 * @param filter - The filter to select the documents to update.
	 * @param update - The update operation to apply to the selected documents.
	 * @param options - Optional settings for the update operation.
	 * @returns A promise that resolves to the update result.
	 */
	async updateMany(
		filter: FilterQuery<T>,
		update: UpdateWithAggregationPipeline | UpdateQuery<T>,
		options?: QueryOptions<T>,
	): Promise<UpdateResult> {
		const result = await this.model.updateMany(filter, update, options);
		const event = new ManyEntityUpdated(
			this.model,
			Object.getPrototypeOf(this),
			filter,
			update,
			new Date(),
		);
		this.eventEmitter.emit(event.eventName, event);
		return result;
	}

	async findOneAndUpdate(
		filter: FilterQuery<T>,
		update: UpdateQuery<T>,
		options: QueryOptions<T> = {},
	) {
		return await this.updateOne(filter, update, options);
	}

	/**
	 * Updates a single document in the collection that matches the given filter.
	 *
	 * @param filter - The filter used to select the document to update.
	 * @param update - The update operation to apply to the selected document.
	 * @param options - Optional settings for the update operation.
	 * @returns A promise that resolves to the update result or the updated document.
	 */
	async updateOne(
		filter: FilterQuery<T>,
		update: UpdateQuery<T>,
		options: QueryOptions<T> = {},
	): Promise<T | null> {
		const before = await this.model.findOne(filter, null, options);
		if (!before) {
			return null;
		}
		const updateQuery$ = this.model.findOneAndUpdate(
			{ ...filter, __v: before.__v },
			update,
			{
				...options,
				new: true,
			},
		);

		const result = await updateQuery$;
		const event = new EntityUpdatedEvent(
			this.model,
			this.constructor as typeof EntityRepository,
			before._id.toString(),
			before,
			result,
			new Date(),
		);
		this.logger.debug(`Emitting ${event.eventName}`);
		await this.eventEmitter.emitAsync(event.eventName, event);

		return result;
	}

	/**
	 * Finds a document by its ID and updates it.
	 *
	 * @param id - The ID of the document to find and update.
	 * @param update - The update query to apply to the document.
	 * @param options - Optional query options.
	 * @returns A Promise that resolves to the updated document.
	 */
	async findByIdAndUpdate(
		id: string | ObjectIdType,
		update: UpdateQuery<T>,
		options?: QueryOptions<T>,
	) {
		const filter = { _id: typeof id === 'string' ? new ObjectId(id) : id };

		return await this.updateOne(filter, update, options);
	}

	/**
	 * Finds a document by its ID.
	 * @param id - The ID of the document to find.
	 * @returns A Promise that resolves to the found document.
	 */
	async findById(id: string): Promise<T> {
		return this.model.findById(id);
	}

	/**
	 * Finds documents in the repository based on the provided filter, projection, and options.
	 *
	 * @param filter - The filter query to apply when searching for documents.
	 * @param projection - The optional projection to apply when retrieving the documents.
	 * @param options - The optional query options to customize the search behavior.
	 * @returns A promise that resolves to an array of documents
	 */
	find(
		filter: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Query<
		HydratedDocument<T, any, any>[],
		HydratedDocument<T, any, any>,
		any,
		T
	> {
		return this.model.find(filter, projection, options);
	}

	/**
	 * Finds documents in the database that match the specified filter and iterates over them asynchronously.
	 *
	 * @async
	 * @generator
	 * @template T - The type of the documents being iterated.
	 * @param {FilterQuery<T>} filter - The filter to apply when searching for documents.
	 * @param {ProjectionType<T>} [projection] - The projection to apply when retrieving documents.
	 * @param {QueryOptions<T>} [options] - The options to apply when executing the query.
	 * @returns {AsyncGenerator<T, any, any>} An async generator that yields each document found.
	 */
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

	/**
	 * Finds a single document in the collection that matches the given filter.
	 *
	 * @param filter - The filter to apply when searching for the document.
	 * @param projection - The optional projection to apply when retrieving the document.
	 * @param options - The optional query options.
	 * @returns A promise that resolves to the found document, or null if no document matches the filter.
	 */
	findOne(
		filter: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Query<
		HydratedDocument<T, any, any>,
		HydratedDocument<T, any, any>,
		any,
		T
	> {
		return this.model.findOne(filter, projection, options);
	}

	/**
	 * Counts the number of documents that match the given filter.
	 *
	 * @param filter - The filter query to apply.
	 * @param options - Optional query options.
	 * @returns A promise that resolves to the number of matching documents.
	 */
	async count(filter: FilterQuery<T> = {}): Promise<number> {
		return await this.model.count(filter);
	}

	/**
	 * Creates a new entity.
	 * @param entity The entity to create.
	 * @returns A promise that resolves to the created entity.
	 */
	async create(entity: T): Promise<T> {
		return this.model.create(entity);
	}

	/**
	 * Executes an aggregation framework pipeline on the model's collection.
	 *
	 * @param pipeline - An array of aggregation pipeline stages to be executed.
	 * @param options - Optional settings for the aggregation operation.
	 * @returns A promise that resolves to the aggregation result.
	 */
	aggregate<R = unknown>(
		pipeline: PipelineStage[],
		options?: AggregateOptions,
	): Aggregate<R[]> {
		return this.model.aggregate<R>(pipeline, options);
	}
}

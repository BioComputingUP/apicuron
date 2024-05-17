import {
	Document,
	FilterQuery,
	Model,
	ObjectId,
	ProjectionType,
	QueryOptions,
	UpdateQuery,
	UpdateWithAggregationPipeline,
} from 'mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityUpdatedEvent } from '../events/entity-updated.event';
import { MassEntityUpdated } from '../events/mass-entity-updated.event';
import { EntityDeletedEvent } from '../events/entity-deleted.event';

export abstract class EntityRepository<T extends Document> {
	constructor(
		protected readonly model: Model<T>,
		protected readonly eventEmitter: EventEmitter2,
	) {}

	/**
	 * Deletes a document from the database by its ID.
	 *
	 * @param id - The ID of the document to delete.
	 * @returns A Promise that resolves to the deleted document.
	 */
	async deleteById(id: string): Promise<T> {
		const doc = await this.model.findByIdAndDelete(id);

		const event = new EntityDeletedEvent(
			this.model.modelName,
			id,
			doc,
			new Date(),
		);
		this.eventEmitter.emit(event.name, event);
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
			this.model.modelName,
			doc._id.toString(),
			doc,
			new Date(),
		);
		this.eventEmitter.emit(event.name, event);
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
		const event = new MassEntityUpdated(
			this.model.modelName,
			filter,
			update,
			new Date(),
		);
		this.eventEmitter.emit(event.name, event);
		return result;
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
		options?: QueryOptions<T>,
	): Promise<UpdateResult | T> {
		const before = await this.model.findOne(filter, options);
		const result = await this.model.findOneAndUpdate(filter, update, {
			...options,
			new: true,
		});
		const event = new EntityUpdatedEvent(
			this.model.modelName,
			before._id.toString(),
			before,
			result,
			new Date(),
		);
		this.eventEmitter.emit(event.name, event);

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
		id: string | ObjectId,
		update: UpdateQuery<T>,
		options?: QueryOptions<T>,
	) {
		const before = await this.model.findById(id);
		const doc = await this.model.findByIdAndUpdate(id, update, {
			...options,
			new: true,
		});
		const event = new EntityUpdatedEvent(
			this.model.modelName,
			id.toString(),
			before,
			doc,
			new Date(),
		);

		this.eventEmitter.emit(event.name, event);

		return doc;
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
	 * @returns A promise that resolves to an array of documents or a single document.
	 */
	async find(
		filter: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T[] | T> {
		return await this.model.find(filter, projection, options);
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
	async findOne(
		filter: FilterQuery<T>,
		projection?: ProjectionType<T>,
		options?: QueryOptions<T>,
	): Promise<T> {
		return await this.model.findOne(filter, projection, options);
	}

	/**
	 * Counts the number of documents that match the given filter.
	 *
	 * @param filter - The filter query to apply.
	 * @param options - Optional query options.
	 * @returns A promise that resolves to the number of matching documents.
	 */
	async count(
		filter: FilterQuery<T>,
		options?: QueryOptions<T>,
	): Promise<number> {
		return await this.model.countDocuments(filter, options);
	}

	/**
	 * Creates a new entity.
	 * @param entity The entity to create.
	 * @returns A promise that resolves to the created entity.
	 */
	async create(entity: T): Promise<T> {
		return this.model.create(entity);
	}
}

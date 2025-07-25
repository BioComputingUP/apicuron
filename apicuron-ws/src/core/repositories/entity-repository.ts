import { Logger, OnModuleDestroy } from '@nestjs/common';
import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
import {
	Aggregate,
	AggregateOptions,
	FilterQuery,
	HydratedDocument,
	Model,
	ObjectId as ObjectIdType,
	PipelineStage,
	ProjectionType,
	Query,
	QueryOptions,
	UpdateQuery,
	UpdateWithAggregationPipeline,
} from 'mongoose';
import {
	EntityDeletedEvent,
	EntityUpdatedEvent,
	ManyEntityUpdated,
} from '../events';
import { RepositoryEventPublisher } from '../helpers/event-mapper';
import {
	ExtractMethodsAndOverrides,
	ExtractQueryHelpers,
	ExtractSchema,
	ExtractVirtuals,
	RepositoryEvent,
} from '../interfaces/entity-repository';

export abstract class EntityRepository<
	EntityClass,
	EntityModel extends Model<
		EntityClass,
		TQueryHelpers,
		TMethodsAndOverrides,
		TVirtuals,
		TSchema
	>,
	TQueryHelpers = ExtractQueryHelpers<EntityModel>,
	TMethodsAndOverrides = ExtractMethodsAndOverrides<EntityModel>,
	TVirtuals = ExtractVirtuals<EntityModel>,
	TSchema = ExtractSchema<EntityModel>,
	// EntityDoc = HydratedDocument<EntityClass, TMethodsAndOverrides, TVirtuals>,
> implements OnModuleDestroy
{
	constructor(protected readonly model: EntityModel) {}
	onModuleDestroy() {
		this.publisher.destroy();
	}

	publisher = new RepositoryEventPublisher<RepositoryEvent<EntityClass>>();

	private logger = new Logger(EntityRepository.name);

	/**
	 * Deletes a document from the database by its ID.
	 *
	 * @param id - The ID of the document to delete.
	 * @returns A Promise that resolves to the deleted document.
	 */
	async deleteById(
		id: string,
	): Promise<HydratedDocument<EntityClass, TMethodsAndOverrides, TVirtuals>> {
		const doc = await this.model.findByIdAndDelete(id).exec();

		const event = new EntityDeletedEvent<EntityClass>(
			id,
			doc.toObject(),
			new Date(),
		);
		await this.publisher.publish({
			name: EntityDeletedEvent.name,
			value: event,
		});
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
		filter: FilterQuery<EntityClass>,
		options?: QueryOptions<EntityClass>,
	): Promise<HydratedDocument<
		EntityClass,
		TMethodsAndOverrides,
		TVirtuals
	> | null> {
		const doc = await this.model.findOneAndDelete(filter, options).exec();
		const event = new EntityDeletedEvent<EntityClass>(
			doc._id.toString(),
			doc.toObject(),
			new Date(),
		);
		await this.publisher.publish({
			name: EntityDeletedEvent.name,
			value: event,
		});
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
		filter: FilterQuery<EntityClass>,
		options?: QueryOptions<EntityClass>,
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
		filter: FilterQuery<EntityClass>,
		update: UpdateWithAggregationPipeline | UpdateQuery<EntityClass>,
		options?: QueryOptions<EntityClass>,
	): Promise<UpdateResult> {
		const result = await this.model.updateMany(filter, update, options);
		const event = new ManyEntityUpdated(filter, update, new Date());
		await this.publisher.publish({
			name: ManyEntityUpdated.name,
			value: event,
		});
		return result;
	}

	async findOneAndUpdate(
		filter: FilterQuery<EntityClass>,
		update: UpdateQuery<EntityClass>,
		options: QueryOptions<EntityClass> = {},
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
		filter: FilterQuery<EntityClass>,
		update: UpdateQuery<EntityClass>,
		options: QueryOptions<EntityClass> = {},
	): Promise<HydratedDocument<
		EntityClass,
		TMethodsAndOverrides,
		TVirtuals
	> | null> {
		const before = await this.model.findOne(filter, null, options);
		if (!before || !('__v' in before)) {
			return null;
		}

		const updateQuery$ = this.model
			.findOneAndUpdate(
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				{ ...filter, __v: before.__v },
				update,
				{
					...options,
					new: true,
				},
			)
			.exec();

		const result = await updateQuery$;
		const event = new EntityUpdatedEvent<EntityClass>(
			before._id.toString(),
			before.toObject(),
			result.toObject(),
			new Date(),
		);
		await this.publisher.publish({
			name: EntityUpdatedEvent.name,
			value: event,
		});

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
		update: UpdateQuery<EntityClass>,
		options?: QueryOptions<EntityClass>,
	) {
		const filter = { _id: typeof id === 'string' ? new ObjectId(id) : id };

		return await this.updateOne(filter, update, options);
	}

	/**
	 * Finds a document by its ID.
	 * @param id - The ID of the document to find.
	 * @returns A Promise that resolves to the found document.
	 */
	async findById(
		id: string,
	): Promise<HydratedDocument<EntityClass, TMethodsAndOverrides, TVirtuals>> {
		return await this.model.findById(id).exec();
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
		filter: FilterQuery<EntityClass>,
		projection?: ProjectionType<EntityClass>,
		options?: QueryOptions<EntityClass>,
	): Query<
		HydratedDocument<EntityClass, TMethodsAndOverrides, TVirtuals>[],
		HydratedDocument<EntityClass, TMethodsAndOverrides, TVirtuals>,
		TQueryHelpers,
		EntityClass
	> {
		return this.model.find<
			HydratedDocument<EntityClass, TMethodsAndOverrides, TVirtuals>
		>(filter, projection, options);
	}

	/**
	 * Finds documents in the database that match the specified filter and iterates over them asynchronously.
	 *
	 * @async
	 * @generator
	 * @template T - The type of the documents being iterated.
	 * @param {FilterQuery<EntityClass>} filter - The filter to apply when searching for documents.
	 * @param {ProjectionType<EntityClass>} [projection] - The projection to apply when retrieving documents.
	 * @param {QueryOptions<EntityClass>} [options] - The options to apply when executing the query.
	 * @returns {AsyncGenerator<EntityClass, any, any>} An async generator that yields each document found.
	 */
	async *findAndIterate(
		filter: FilterQuery<EntityClass>,
		projection?: ProjectionType<EntityClass>,
		options?: QueryOptions<EntityClass>,
	): AsyncGenerator<
		HydratedDocument<EntityClass, TMethodsAndOverrides, TVirtuals>,
		void,
		unknown
	> {
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
		filter: FilterQuery<EntityClass>,
		projection?: ProjectionType<EntityClass> | null,
		options?: QueryOptions<EntityClass> | null,
	): Promise<HydratedDocument<
		EntityClass,
		TMethodsAndOverrides,
		TVirtuals
	> | null> {
		const result = this.model.findOne(filter, projection, options).exec();
		return result;
	}

	/**
	 * Counts the number of documents that match the given filter.
	 *
	 * @param filter - The filter query to apply.
	 * @param options - Optional query options.
	 * @returns A promise that resolves to the number of matching documents.
	 */
	async count(filter: FilterQuery<EntityClass> = {}): Promise<number> {
		return await this.model.count(filter);
	}

	/**
	 * Creates a new entity.
	 * @param entity The entity to create.
	 * @returns A promise that resolves to the created entity.
	 */
	async create(
		entity: EntityClass,
	): Promise<HydratedDocument<EntityClass, TMethodsAndOverrides, TVirtuals>> {
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

	async exists(filter: FilterQuery<EntityClass>): Promise<boolean> {
		return await !!this.model.exists(filter);
	}
}

import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	CallbackWithoutResultAndOptionalError,
	Document,
	HydratedDocument,
	Query,
	Schema,
} from 'mongoose';
import {
	queryEvents,
	defaultNamespace,
	documentEvents,
	saveEvent,
} from './constants/base';
import { DocumentEvent, QueryEvent } from './types/base';
import { buildEventName, buildEventObject } from './helpers/event-builder';
import {
	registerPostDocumentHook,
	registerPostQueryHook,
	registerPostSaveHook,
	registerPostValidateHook,
	registerPreQueryHook,
} from './handlers/document.hook';

@Injectable()
export class MongoEventsService {
	constructor(protected eventEmitter: EventEmitter2) {}

	// buildEventObject(event: MongooseEvent, query: Query<any, any, {}, any>) {
	// 	// check if the query if a query or an update query
	// }

	// registerPostSaveHook(schema: Schema, eventEmitter: EventEmitter2) {
	// 	console.log('registerPostSaveHook');
	// 	schema.post<HydratedDocument<any, any>>(
	// 		saveEvent,
	// 		{ query: false, document: true },
	// 		function (
	// 			doc: Document<any, any>,
	// 			next: CallbackWithoutResultAndOptionalError,
	// 		) {
	// 			console.log('registerPostSaveHook post save event');
	// 			if (
	// 				!(doc instanceof Document && this.constructor.modelName != undefined)
	// 			) {
	// 				next();
	// 				return;
	// 			}
	// 			next();
	// 			console.log('registerPostSaveHook post save after checking');

	// 			const eventName = buildEventName(
	// 				this.constructor.modelName,
	// 				'document',
	// 				'post',
	// 				saveEvent,
	// 			);
	// 			console.log('eventName: ', eventName);
	// 			const eventObj = buildEventObject(saveEvent, 'document', 'post', {
	// 				thisObj: this,
	// 			});

	// 			console.log('eventObj: ', eventObj);

	// 			console.log('emit event', eventName, eventObj);
	// 			eventEmitter.emit(eventName, {
	// 				occurence: 'post',
	// 				eventType: 'document',
	// 				modelName: this.constructor.modelName,
	// 			});

	// 			// eventEmitter.emit(
	// 			// 	`${defaultNamespace}.${doc.collection.collectionName}.${hookType}.${saveEvent}`,
	// 			// 	{
	// 			// 		hookType,
	// 			// 		data: doc,
	// 			// 		thisObj: this,
	// 			// 		event: saveEvent,
	// 			// 		collectionName: doc.collection.collectionName,
	// 			// 	},
	// 			// );

	// 			return;
	// 		},
	// 	);
	// }

	public loadMongoosePlugin() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const mongoEvent = this;

		return (schema: Schema) => {
			// queryEvents.forEach((event: QueryEvent) => {
			// 	schema.pre<Query<any, any>>(
			// 		event,
			// 		{ query: true, document: false },
			// 		function (next: CallbackWithoutResultAndOptionalError) {
			// 			mongoEvent.eventEmitter.emit(
			// 				`${defaultNamespace}.query.pre.${this.model.modelName}.${event}`,
			// 				{
			// 					filter: this.getFilter(),
			// 					options: this.getOptions(),

			// 					modelName: this.model.modelName,
			// 					doc: null,
			// 					query: this,
			// 					result: null,
			// 					occurence: 'pre',
			// 					eventType: 'query',
			// 					eventName: event,
			// 					thisObj: this,
			// 				},
			// 			);
			// 			next();
			// 		},
			// 	);
			// });

			// queryEvents.forEach((event: QueryEvent) => {
			// 	schema.post<Query<any, any>>(
			// 		event,
			// 		function (this, result, next: CallbackWithoutResultAndOptionalError) {
			// 			next();

			// 			const eventName = buildEventName(
			// 				this.model.modelName,
			// 				'query',
			// 				'post',
			// 				event,
			// 			);
			// 			mongoEvent.eventEmitter.emit(eventName, {
			// 				modelName: this.model.modelName,
			// 				doc: null,
			// 				result,
			// 				occurence: 'post',
			// 				eventType: 'query',
			// 				eventName: event,
			// 				thisObj: this,
			// 			});

			// 			return;
			// 		},
			// 	);
			// });

			// documentEvents.forEach((event: DocumentEvent) => {
			// 	schema.post<HydratedDocument<any, any>>(
			// 		event,
			// 		{ query: false, document: true },
			// 		function (
			// 			doc: Document | Document[],
			// 			next: CallbackWithoutResultAndOptionalError,
			// 		) {
			// 			if (doc instanceof Document) {
			// 				console.log(
			// 					`On event ${event} this.constructor.modelName:  `,
			// 					this.constructor.modelName,
			// 				);
			// 			}

			// 			if (Array.isArray(doc)) {
			// 				doc.forEach((d) => {
			// 					mongoEvent.eventEmitter.emit(
			// 						`${defaultNamespace}.document.post.modelName.${event}`,
			// 						{
			// 							// modelName: this.model.modelName,
			// 							hookType: 'documents.post',
			// 							data: d,
			// 							thisObj: this,
			// 							event: event,
			// 							// collection: this.model.collection.name,
			// 						},
			// 					);
			// 				});
			// 				next();
			// 				return;
			// 			}
			// 			next();

			// 			mongoEvent.eventEmitter.emit(
			// 				`${defaultNamespace}.${doc.collection.collectionName}.document.post.${event}`,
			// 				{
			// 					// modelName: this.model.modelName,
			// 					hookType: 'document.post',
			// 					data: doc,
			// 					thisObj: this,
			// 					event: event,
			// 					collectionName: doc.collection.collectionName,
			// 					// collection: this.model.collection.name,
			// 				},
			// 			);

			// 			return;
			// 		},
			// 	);
			// });

			// Query Hooks
			registerPreQueryHook(schema, this.eventEmitter);
			registerPostQueryHook(schema, this.eventEmitter);

			// Document Hooks
			registerPostDocumentHook(schema, this.eventEmitter);

			// save and validation post hooks
			registerPostSaveHook(schema, this.eventEmitter);
			registerPostValidateHook(schema, this.eventEmitter);
		};
	}
}

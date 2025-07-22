import {
	CallbackWithoutResultAndOptionalError,
	Document,
	HydratedDocument,
	Query,
	Schema,
} from 'mongoose';
import {
	defaultNamespace,
	documentEvents,
	queryEvents,
	saveEvent,
	validateEvent,
} from '../constants/base';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { buildEventName, buildEventObject } from '../helpers/event-builder';
import { DocumentEvent, QueryEvent } from '../types/base';

export function registerPostSaveHook(
	schema: Schema,
	eventEmitter: EventEmitter2,
) {
	schema.post<HydratedDocument<any, any>>(
		saveEvent,
		{ query: false, document: true },
		async function (
			doc: Document<any, any>,
			next: CallbackWithoutResultAndOptionalError,
		) {
			if (
				!(doc instanceof Document && this.constructor.modelName != undefined)
			) {
				next();
				return;
			}
			next();

			const eventName = buildEventName(
				this.constructor.modelName,
				'document',
				'post',
				saveEvent,
			);

			const eventObj = buildEventObject(saveEvent, 'document', 'post', {
				thisObj: this,
			});

			await eventEmitter.emit(eventName, eventObj);

			return;
		},
	);
}

export function registerPostValidateHook(
	schema: Schema,
	eventEmitter: EventEmitter2,
) {
	schema.post<HydratedDocument<any, any>>(
		validateEvent,
		{ query: false, document: true },
		function (
			doc: Document<any, any>,
			next: CallbackWithoutResultAndOptionalError,
		) {
			if (
				!(doc instanceof Document && this.constructor.modelName != undefined)
			) {
				next();
				return;
			}
			next();

			const eventName = buildEventName(
				this.constructor.modelName,
				'document',
				'post',
				validateEvent,
			);

			const eventObj = buildEventObject(validateEvent, 'document', 'post', {
				thisObj: this,
			});

			eventEmitter.emit(eventName, eventObj);

			return;
		},
	);
}

export function registerPreQueryHook(
	schema: Schema,
	eventEmitter: EventEmitter2,
) {
	queryEvents.forEach((event: QueryEvent) => {
		schema.pre<Query<any, any>>(
			event,
			{ query: true, document: false },
			async function (next: CallbackWithoutResultAndOptionalError) {
				const eventName = buildEventName(
					this.model.modelName,
					'query',
					'pre',
					event,
				);

				const eventObject = buildEventObject(event, 'query', 'pre', {
					thisObj: this,
				});
				await eventEmitter.emitAsync(eventName, eventObject);
				next();
			},
		);
	});
}

export function registerPostQueryHook(
	schema: Schema,
	eventEmitter: EventEmitter2,
) {
	queryEvents.forEach((event: QueryEvent) => {
		schema.post<Query<any, any>>(
			event,
			async function (
				this,
				result,
				next: CallbackWithoutResultAndOptionalError,
			) {
				next();

				const eventName = buildEventName(
					this.model.modelName,
					'query',
					'post',
					event,
				);
				const eventObject = buildEventObject(event, 'query', 'post', {
					thisObj: this,
					result,
				});
				await eventEmitter.emitAsync(eventName, eventObject);

				return;
			},
		);
	});
}

export function registerPostDocumentHook(
	schema: Schema,
	eventEmitter: EventEmitter2,
) {
	documentEvents.forEach((event: DocumentEvent) => {
		schema.post<HydratedDocument<any, any>>(
			event,
			{ query: false, document: true },
			async function (
				doc: Document<any, any>,
				next: CallbackWithoutResultAndOptionalError,
			) {
				next();

				if (!this.constructor.modelName) {
					return;
				}

				const eventName = buildEventName(
					this.constructor.modelName,
					'document',
					'post',
					event,
				);

				const eventObject = buildEventObject(event, 'document', 'post', {
					thisObj: this,
					doc,
				});

				await eventEmitter.emitAsync(eventName, eventObject);

				return;
			},
		);
	});
}

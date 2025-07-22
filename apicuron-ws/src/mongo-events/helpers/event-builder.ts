import { defaultNamespace, saveEvent } from '../constants/base';
import {
	EventOccurence,
	EventType,
	MiddlewareData,
	MongooseEvent,
	MongooseEventObject,
	MongooseQueryPostEventObject,
	MongooseQueryPreEventObject,
} from '../types/base';

export function buildEventName(
	modelName: string,
	eventType: 'document' | 'query',
	occurence: 'pre' | 'post',
	eventName: MongooseEvent,
	options = {
		eventNamespace: defaultNamespace,
	},
) {
	return `${options.eventNamespace}.${modelName}.${eventType}.${occurence}.${eventName}`;
}

export function buildEventObject(
	mongooseEvent: MongooseEvent,
	eventType: EventType,
	occurence: EventOccurence,
	data: MiddlewareData,
): MongooseEventObject {
	if (
		mongooseEvent == saveEvent &&
		occurence == 'post' &&
		eventType == 'document'
	) {
		return {
			modelName: data.thisObj.constructor.modelName,
			doc: data.doc,
			occurence: 'post',
			eventType: 'document',
			mongooseEvent,
			thisObj: data.thisObj,
		};
	}
	if (eventType == 'document' && occurence == 'post') {
		return {
			modelName: data.thisObj.constructor.modelName,
			doc: data.doc,
			occurence: 'post',
			eventType: 'document',
			mongooseEvent,
			thisObj: data.thisObj,
		};
	}

	if (eventType == 'query' && occurence == 'pre') {
		return {
			filter: data.thisObj?.getFilter(),
			options: data.thisObj?.getOptions(),

			modelName: data.thisObj.model.modelName,
			mongooseEvent,
			query: data.thisObj,
			occurence: 'pre',
			eventType: 'query',
			thisObj: data.thisObj,
		} as MongooseQueryPreEventObject;
	}
	if (eventType == 'query' && occurence == 'post') {
		return {
			modelName: data.thisObj.model.modelName,
			result: data.result,
			occurence: 'post',
			eventType: 'query',
			mongooseEvent,
			thisObj: data.thisObj,
		} as MongooseQueryPostEventObject;
	}

	console.error('No event object built');
	throw new Error('Not implemented');
}

import { MongooseEvent } from '../types/base';
import { defaultNamespace } from '../constants/base';

export function getEventToken(
	modelName: string,
	eventType: 'document' | 'query',
	occurence: 'pre' | 'post',
	eventName: MongooseEvent,
) {
	return `${defaultNamespace}.${modelName}.${eventType}.${occurence}.${eventName}`;
}

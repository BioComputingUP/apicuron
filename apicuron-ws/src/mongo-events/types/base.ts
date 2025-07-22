import {
	queryEvents,
	documentEvents,
	saveEvent,
	validateEvent,
} from '../constants/base';
import { Document, FilterQuery, Query } from 'mongoose';

export type QueryEvent = typeof queryEvents[number];
export type DocumentEvent = typeof documentEvents[number];

export type SaveEvent = typeof saveEvent;
export type validateEvent = typeof validateEvent;

export type MongooseEvent =
	| QueryEvent
	| DocumentEvent
	| SaveEvent
	| validateEvent;

export type EventType = 'document' | 'query';
export type EventOccurence = 'pre' | 'post';

export type MongooseDocumentPostEvent = {
	modelName: string;
	doc: Document<any, any>;
	thisObj: any | Document<any, any>;
	eventName: MongooseEvent;
};

export type MiddlewareData = {
	thisObj: any;
	doc?: Document<any, any>;
	query?: Query<any, any>;
	result?: any;
};

export type MongooseEventObject =
	| MongooseQueryPreEventObject
	| MongooseQueryPostEventObject
	| {
			modelName: string;
			doc?: Document<any, any>;
			query?: any;
			occurence: EventOccurence;
			eventType: EventType;
			mongooseEvent: MongooseEvent;
			thisObj: any;
	  };

export type MongooseQueryPreEventObject = {
	modelName: string;
	filter?: FilterQuery<any>;
	options?: any;
	query?: Query<any, any>;
	occurence: EventOccurence;
	eventType: EventType;
	mongooseEvent: MongooseEvent;
	thisObj: any;
};

export type MongooseQueryPostEventObject = {
	modelName: string;
	result?: any;
	occurence: EventOccurence;
	eventType: EventType;
	mongooseEvent: MongooseEvent;
	thisObj: any;
};

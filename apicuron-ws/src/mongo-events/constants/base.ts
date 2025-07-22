export const queryEvents = [
	'count',
	'deleteMany',
	'deleteOne',
	'distinct',
	'find',
	'findOne',
	'findOneAndDelete',
	'findOneAndRemove',
	'findOneAndReplace',
	'findOneAndUpdate',
	'remove',
	'replaceOne',
	'update',
	'updateOne',
	'updateMany',
] as const;

export const validateEvent = 'validate' as const;
export const saveEvent = 'save' as const;
export const documentEvents = [
	'remove',
	'updateOne',
	'deleteOne',
	// 'init',
] as const;

export const defaultNamespace = 'MongoEvent';

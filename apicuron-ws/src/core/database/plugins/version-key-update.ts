import { Schema } from 'mongoose';

// function obtained from https://mongoosejs.com/docs/guide.html#versionKey
export function versionKeyUpdatePlugin(schema: Schema) {
	schema.pre('findOneAndUpdate', function () {
		const update = this.getUpdate();
		if (update instanceof Array || update == null) {
			return;
		}
		if (update.__v != null) {
			delete update.__v;
		}
		const keys = ['$set', '$setOnInsert'];
		for (const key of keys) {
			if (update[key] != null && update[key].__v != null) {
				delete update[key].__v;
				if (Object.keys(update[key]).length === 0) {
					delete update[key];
				}
			}
		}
		update.$inc = update.$inc || {};
		update.$inc.__v = 1;
	});
}

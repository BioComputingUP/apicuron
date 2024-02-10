import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MongooseEventObject } from './mongo-events/types/base';
@Injectable()
export class AppService {
	getHello(): string {
		return 'Hello World!';
	}

	// @OnEvent('MongoEvent.**', { async: true })
	// async handleMongoPostEvent(event) {
	// 	await new Promise<void>((resolve, reject) => {
	// 		setTimeout(() => {
	// 			console.log('MongoEvent post: ', event.hookType);
	// 			resolve();
	// 		}, 500);
	// 	});
	// }

	// @OnEvent('MongoEvent.**', { async: true })
	// async handleMongoPreEvent({
	// 	occurence,
	// 	eventType,
	// 	modelName,
	// 	mongooseEvent,
	// }: MongooseEventObject): Promise<void> {
	// 	return new Promise<void>((resolve, reject) => {
	// 		setTimeout(() => {
	// 			console.log(
	// 				`MongoEvent: ${occurence} ${eventType} ${mongooseEvent} ${modelName}`,
	// 			);
	// 			resolve();
	// 		}, 1000);
	// 	});
	// }
}

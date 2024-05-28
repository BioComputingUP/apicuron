import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MongooseEventObject } from './mongo-events/types/base';
@Injectable()
export class AppService {
	constructor(eventEmitter: EventEmitter2) {
		console.log('AppModuleInit');
		console.log(eventEmitter);
	}
	getHello(): string {
		return 'Hello World!';
	}

	@OnEvent('testevent', { async: true, promisify: true, prependListener: true })
	async test() {
		return 'test text';
	}
}

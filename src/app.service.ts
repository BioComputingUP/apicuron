import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MongooseEventObject } from './mongo-events/types/base';
@Injectable()
export class AppService {
	getHello(): string {
		return 'Hello World!';
	}
}

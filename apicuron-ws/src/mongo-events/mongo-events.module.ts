import { Module } from '@nestjs/common';
import { MongoEventsService } from './mongo-events.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
	imports: [EventEmitterModule],
	providers: [MongoEventsService],
	exports: [MongoEventsService],
})
export class MongoEventsModule {}

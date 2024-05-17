import { Model } from 'mongoose';
import { Statistics, StatisticsDocument } from '../schemas/statistics.schema';
import { EntityRepository } from './abstract-repository';
import { InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
export class StatisticsRepository extends EntityRepository<StatisticsDocument> {
	constructor(
		@InjectModel(Statistics.name) statModel: Model<StatisticsDocument>,
		eventEmitter: EventEmitter2,
	) {
		super(statModel, eventEmitter);
	}
}

import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
	Statistics, StatisticsModel
} from '../schemas/statistics.schema';
import { EntityRepository } from './entity-repository';
export class StatisticsRepository extends EntityRepository<
	Statistics,
	StatisticsModel
> {
	constructor(
		@InjectModel(Statistics.name) statModel: StatisticsModel,
		eventEmitter: EventEmitter2,
	) {
		super(statModel);
	}
}

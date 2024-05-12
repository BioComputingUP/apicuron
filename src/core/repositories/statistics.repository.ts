import { Model } from 'mongoose';
import { Statistics, StatisticsDocument } from '../schemas/statistics.schema';
import { EntityRepository } from './abstract-repository';
import { InjectModel } from '@nestjs/mongoose';

export class StatisticsRepository extends EntityRepository<StatisticsDocument> {
	constructor(
		@InjectModel(Statistics.name) statModel: Model<StatisticsDocument>,
	) {
		super(statModel);
	}
}

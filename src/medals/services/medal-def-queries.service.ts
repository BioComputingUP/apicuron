import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, QueryOptions } from 'mongoose';
import {
	MedalDef,
	MedalDefDocument,
} from '../../core/schemas/achievements-def/medal-def.schema';

@Injectable()
export class MedalDefQueriesService {
	constructor(
		@InjectModel(MedalDef.name)
		protected medalDefModel: Model<MedalDefDocument>,
	) {}
	async getMedalDefs(
		queryFilter: FilterQuery<MedalDefDocument> = {},
		options: QueryOptions<MedalDefDocument> = {},
	) {
		const data$ = this.medalDefModel.find(queryFilter, {}, options);
		const count$ = this.medalDefModel.count(queryFilter);

		const [data, count] = await Promise.all([data$, count$]);

		return {
			data,
			count,
		};
	}
}

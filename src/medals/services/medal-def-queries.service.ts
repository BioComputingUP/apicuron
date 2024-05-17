import { Injectable } from '@nestjs/common';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, QueryOptions } from 'mongoose';
import { MedalDefDocument } from '../../core/schemas/achievements-def/medal-def.schema';

@Injectable()
export class MedalDefQueriesService {
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
	) {}
	async getMedalDefs(
		queryFilter: FilterQuery<MedalDefDocument> = {},
		options: QueryOptions<MedalDefDocument> = {},
	) {
		const data$ = this.badgeDefModel.find(queryFilter, {}, options);
		const count$ = this.badgeDefModel.count(queryFilter);

		const [data, count] = await Promise.all([data$, count$]);

		return {
			data,
			count,
		};
	}
}

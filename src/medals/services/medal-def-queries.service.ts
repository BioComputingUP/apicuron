import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import {
	MedalDef,
	MedalDefDocument,
} from '../../core/schemas/achievements-def/medal-def.schema';
import { MedalDefFilter } from '../dto/filter-medal-def.dto';
import * as _ from 'lodash';
import { AchievementDef } from 'src/core/schemas/achievements-def/achievement-def.schema';
@Injectable()
export class MedalDefQueriesService {
	constructor(
		@InjectModel(MedalDef.name)
		protected medalDefModel: Model<MedalDefDocument>,
	) {}
	async getMedalDefs(
		medalFilter: MedalDefFilter,
		queryFilter: FilterQuery<MedalDefDocument> = {},
	) {
		const { search_query, name, ...remainingFilters } =
			medalFilter.omitPagination();
		const nameSearchFilter = {};
		if (name) {
			// if name is passed,always use it to prevent breaking existing uses
			nameSearchFilter['name'] = name;
		} else if (search_query) {
			// process the search query into a regex and pass it as name
			const cleanQuery = _.escapeRegExp(search_query);
			nameSearchFilter['name'] = { $regex: `.*${cleanQuery}.*`, $options: 'i' };
		}
		const combinedBadgeFilters = {
			...remainingFilters,
			...nameSearchFilter,
		};
		const filterQuery: FilterQuery<AchievementDef> = {
			$and: [combinedBadgeFilters, queryFilter],
		};
		console.log(JSON.stringify(filterQuery, null, 2));

		const options = medalFilter.getMongoQueryOptions();

		const data$ = this.medalDefModel.find(filterQuery, {}, options);
		const count$ = this.medalDefModel.count(filterQuery);

		const [data, count] = await Promise.all([data$, count$]);

		return {
			data,
			count,
		};
	}
}

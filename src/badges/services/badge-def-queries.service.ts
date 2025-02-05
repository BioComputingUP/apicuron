import { Injectable } from '@nestjs/common';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { BadgeDefFilter } from '../dto/filter-badge-def.dto';
import { AchievementDef } from '../../core/schemas/achievements-def/achievement-def.schema';
import * as _ from 'lodash';
@Injectable()
export class BadgeDefQueriesService {
	constructor(
		@InjectModel(BadgeDef.name)
		protected badgeDefModel: Model<BadgeDefDocument>,
	) {}
	async getbadgeDefs(
		badgeFilter: BadgeDefFilter,
		queryFilter: FilterQuery<BadgeDefDocument> = {},
	) {
		const { search_query, ...remainingFilters } = badgeFilter.omitPagination();

		const displayedNameSearchFilter = {};
		if (search_query) {
			// process the search query into a regex and pass it as name
			const cleanQuery = _.escapeRegExp(search_query);
			displayedNameSearchFilter['displayedName'] = {
				$regex: `.*${cleanQuery}.*`,
				$options: 'i',
			};
		}
		const combinedBadgeFilters = {
			...remainingFilters,
			...displayedNameSearchFilter,
		};
		const filterQuery: FilterQuery<AchievementDef> = {
			$and: [combinedBadgeFilters, queryFilter],
		};
		const dataPromise = this.badgeDefModel.find(
			filterQuery,
			{},
			badgeFilter.getMongoQueryOptions(),
		);
		const countPromise = this.badgeDefModel.count(filterQuery);

		const [data, count] = await Promise.all([dataPromise, countPromise]);

		return {
			data,
			count,
		};
	}
}

import { Transform, TransformFnParams } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import * as _ from 'lodash';
import { QueryOptions } from 'mongoose';
import { PaginationAggregation } from '../interfaces/pagination-aggregation';

export class PaginateDto {
	@Min(0)
	@IsInt()
	@IsOptional()
	@Transform(({ value }) => {
		return Number.isNaN(parseInt(value)) ? null : parseInt(value);
	})
	skip = 0;

	@Max(100)
	@Min(-1)
	@IsInt()
	@IsOptional()
	@Transform(({ value, obj }: TransformFnParams) => {
		return Number.isNaN(parseInt(value)) ? obj.defaultLimit : parseInt(value);
	})
	limit;

	getMongoQueryOptions<T>(): QueryOptions<T> {
		if (this.limit < 0) {
			return {
				skip: this.skip,
			};
		} else {
			return {
				limit: this.limit,
				skip: this.skip,
			};
		}
	}

	getMongoAggregation(): PaginationAggregation {
		const agg = [];
		if (this.skip) {
			agg.push({ $skip: this.skip });
		}
		if (this.limit && this.limit > 0) {
			agg.push({
				$limit: this.limit,
			});
		}
		return agg as PaginationAggregation;
	}

	omitPagination(): Omit<this, 'skip' | 'limit'> {
		return _.omit(this, ['skip', 'limit']);
	}

	defaultLimit = -1;
}

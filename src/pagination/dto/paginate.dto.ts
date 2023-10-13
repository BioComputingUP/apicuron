import { Transform } from 'class-transformer';
import {
	IsInt,
	IsNumberString,
	IsOptional,
	IsPositive,
	Max,
	Min,
} from 'class-validator';
import * as _ from 'lodash';
import { PipelineStage, QueryOptions } from 'mongoose';
import { PaginationAggregation } from '../interfaces/pagination-aggregation';

export class PaginateDto {
	@Min(0)
	@IsInt()
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	skip = 0;

	@Max(100)
	@Min(-1)
	@IsInt()
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	limit = 10;

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
		const agg: PaginationAggregation = [{ $skip: this.skip }];
		if (this.limit > 0) {
			agg.push({
				$limit: this.limit,
			});
		}
		return agg;
	}

	omitPagination(): Omit<this, 'skip' | 'limit'> {
		return _.omit(this, ['skip', 'limit']);
	}
}

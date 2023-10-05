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
	@Min(1)
	@IsInt()
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	limit = 10;

	getMongoQueryOptions<T>(): QueryOptions<T> {
		return {
			limit: this.limit,
			skip: this.skip,
		};
	}

	getMongoAggregation(): PaginationAggregation {
		return [
			{
				$skip: this.skip,
			},
			{
				$limit: this.limit,
			},
		];
	}

	omitPagination(): Omit<this, 'skip' | 'limit'> {
		return _.omit(this, ['skip', 'limit']);
	}
}

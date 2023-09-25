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
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(0)
	skip: number = 0;

	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	@IsInt()
	@Min(1)
	@Max(100)
	limit: number = 10;

	getMongoQueryOptions<T>(): QueryOptions<T> {

		return {
			limit: this.limit,
			skip: this.skip,
		}
	}

	getMongoAggregation(): PaginationAggregation {
		return [
					{
						$skip: this.skip,
					},
					{
						$limit: this.limit,
					},
			  ]
	}

	omitPagination(): Omit<this, 'skip' | 'limit'> {
		return _.omit(this, ['skip', 'limit'])
	}
}

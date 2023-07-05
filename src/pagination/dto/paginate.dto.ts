import { Transform } from 'class-transformer';
import {
	IsInt,
	IsNumberString,
	IsOptional,
	IsPositive,
	Max,
	Min,
} from 'class-validator';
import { PipelineStage, QueryOptions } from 'mongoose';

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
	limit?: number = null;

	getMongoQueryOptions(): QueryOptions<any> {

		return !! this.limit ? {
			limit: this.limit,
			skip: this.skip,
		}: { skup: this.skip };
	}

	getMongoAggregation(): [PipelineStage.Skip, PipelineStage.Limit?] {
		return !!this.limit
			? [
					{
						$skip: this.skip,
					},
					{
						$limit: this.limit,
					},
			  ]
			: [{ $skip: this.skip }];
	}
}

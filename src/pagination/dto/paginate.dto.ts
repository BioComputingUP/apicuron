import { Transform, TransformFnParams } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, ValidateIf } from 'class-validator';
import { QueryOptions } from 'mongoose';
import { PaginationAggregation } from '../interfaces/pagination-aggregation';
import { omit } from 'lodash';
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
export class BasePaginationDto {
	@ApiProperty({
		description: 'The number of records to skip',
		required: false,
		default: 0,
	})
	@Min(0)
	@IsInt()
	@ValidateIf((o) => o.skip !== undefined)
	@IsOptional()
	@Transform(({ value }): number => {
		return Number.isNaN(parseInt(value)) ? 0 : parseInt(value);
	})
	skip: number;

	@ApiProperty({
		description: 'The limit of records to return',
		required: false,
		default: 10,
	})
	@Max(100)
	@Min(-1)
	@IsInt()
	@IsOptional()
	@ValidateIf((o) => o.limit !== undefined)
	@Transform(({ value, obj }: TransformFnParams): number => {
		return Number.isNaN(parseInt(value)) ? -1 : parseInt(value);
	})
	limit: number;

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
		const agg: PaginationAggregation = [];
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
		return omit(this, ['skip', 'limit']);
	}
}

@ApiExtraModels(PaginationDto)
export class PaginationDto extends BasePaginationDto {
	@ApiProperty()
	@IsOptional()
	skip: number;

	@ApiProperty()
	@IsOptional()
	limit: number;
}

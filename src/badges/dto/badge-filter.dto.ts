import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { pick } from 'lodash';
import { BasePaginationDto } from '../../pagination/dto/paginate.dto';

export class BadgeFilter extends BasePaginationDto {
	@IsOptional()
	@IsString()
	curator_orcid?: string;

	@IsOptional()
	@IsString()
	resource_id?: string;

	@IsOptional()
	@IsString()
	name?: string;

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	@Min(1)
	count_threshold?: number;

	@IsOptional()
	@IsString()
	@IsIn(['count_threshold', 'name'])
	sortBy?: string;

	@IsOptional()
	@IsString()
	@IsIn(['1', '-1', 'asc', 'desc'])
	sortOrder?: '1' | '-1' | 'asc' | 'desc';

	getQuery() {
		return pick(this, [
			'curator_orcid',
			'resource_id',
			'name',
			'count_threshold',
		]);
	}

	defaultLimit: 10;
}

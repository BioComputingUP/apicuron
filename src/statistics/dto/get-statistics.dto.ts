import {
	IsArray,
	IsEnum,
	IsIn,
	IsNumber,
	IsOptional,
	IsString,
	ValidateIf,
} from 'class-validator';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
import { Type } from 'class-transformer';
export enum FilterField {
	displayedName = 'displayedName',
	orcid_id = 'orcid_id',
}

export const statisticsSortByFields = [
	'ranking',
	'total_score',
	'medal_count',
	'badge_count',
	'generation_count',
	'invalidation_count',
	'revision_count',
	'displayedName',
];

export class GetStatisticsDto extends PaginateDto {
	@IsEnum(FilterField, {
		message: `filter field can only be one of these values ${Object.values(
			FilterField,
		)}`,
	})
	@IsOptional()
	filter_field: FilterField;

	@IsString()
	@ValidateIf((o) => o.filter_field)
	query: string;

	@IsArray()
	@IsOptional()
	resources: Array<string>;

	@IsIn(statisticsSortByFields)
	@IsString()
	@IsOptional()
	sortBy:
		| 'ranking'
		| 'total_score'
		| 'medal_count'
		| 'badge_count'
		| 'generation_count'
		| 'invalidation_count'
		| 'revision_count'
		| 'displayedName';

	@IsIn([1, -1])
	@IsNumber()
	@Type(() => Number)
	@IsOptional()
	sortOrder?: 1 | -1;
}

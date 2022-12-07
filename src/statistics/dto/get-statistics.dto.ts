import { Type } from 'class-transformer';
import {
	IsArray,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	ValidateIf,
} from 'class-validator';
export enum FilterField {
	displayedName = 'displayedName',
	orcid_id = 'orcid_id',
}

export class GetStatisticsDto {

	@IsEnum(FilterField,{
        message: `filter field can only be one of these values ${Object.values(FilterField)}`
    })
	@IsOptional()
	filter_field: FilterField;

	@IsString()
	@ValidateIf((o) => o.filter_field)
	query: string;

	@IsArray()
	@IsOptional()
	resources: Array<string>;

	@IsInt()
	@Type(() => Number)
	@IsOptional()
	page: number;

	@IsInt()
	@Type(() => Number)
	@IsOptional()
	page_size: number;

}

import { Type } from 'class-transformer';
import {
	IsArray,
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Min,
	ValidateIf,
} from 'class-validator';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
export enum FilterField {
	displayedName = 'displayedName',
	orcid_id = 'orcid_id',
}

export class GetStatisticsDto extends PaginateDto {

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

}

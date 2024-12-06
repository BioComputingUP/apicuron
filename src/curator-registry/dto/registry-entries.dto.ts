import { IsArray, IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { BasePaginationDto } from "src/pagination/dto/paginate.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";

export enum SearchFieldFilter {
	displayedName = 'displayedName',
	orcid_id = 'orcid_id',
}
export class GetRegistryEntryDto extends BasePaginationDto{
	@IsEnum(SearchFieldFilter, {
		message: `filter field can only be one of these values ${Object.values(
			SearchFieldFilter,
		)}`,
	})
	@ApiPropertyOptional()
	@IsOptional()
	filter_field: SearchFieldFilter;

	@ApiPropertyOptional()
	@IsString()
	@ValidateIf((o) => o.filter_field)
	query: string;

	@ApiPropertyOptional()
	@IsArray()
	@IsOptional()
	resources: string[];
}
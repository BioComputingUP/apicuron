import { IsArray, IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { BasePaginationDto } from "src/pagination/dto/paginate.dto";


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
	@IsOptional()
	filter_field: SearchFieldFilter;

	@IsString()
	@ValidateIf((o) => o.filter_field)
	query: string;

	@IsArray()
	@IsOptional()
	resources: string[];
}
import { IsArray, IsEnum, IsOptional, IsString, ValidateIf } from "class-validator";
import { BasePaginationDto } from "src/pagination/dto/paginate.dto";
import { FilterField } from "src/statistics/dto/get-statistics.dto";
export class RegistryEntriesDto extends BasePaginationDto{
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
	resources: string[];
}
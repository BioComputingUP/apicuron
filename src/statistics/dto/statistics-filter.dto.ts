import { IsIn, IsOptional, IsString, Validate } from 'class-validator';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { OrcidChecksum } from '../../submit-reports/validators/orcid-checksum';
import { PaginateDto } from '../../pagination/dto/paginate.dto';

const sortByFields = [
	'ranking',
	'total_score',
	'medal_count',
	'badge_count',
	'generation_count',
	'invalidation_count',
	'revision_count',
];

export class StatisticsFilter extends PaginateDto {
	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return { resource_id };
		},
	])
	@IsString()
	@IsOptional()
	resource_id: string;

	@IsIn(sortByFields)
	@IsString()
	@IsOptional()
	sortBy:
		| 'ranking'
		| 'total_score'
		| 'medal_count'
		| 'badge_count'
		| 'generation_count'
		| 'invalidation_count'
		| 'revision_count';

	@IsIn(['1', '-1', 'asc', 'desc'])
	@IsString()
	@IsOptional()
	sortOrder?: '1' | '-1' | 'asc' | 'desc';

	@Validate(OrcidChecksum)
	@IsString()
	@IsOptional()
	curator_orcid: string;
}

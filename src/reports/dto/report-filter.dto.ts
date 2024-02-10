import { Transform } from 'class-transformer';
import {
	IsOptional,
	MaxDate,
	Validate,
	IsIn,
	ValidateIf,
	Allow,
} from 'class-validator';
import { User } from '../../core/schemas/user.schema';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { DateAfter, DateBefore } from '../validators/date-comparison';
import * as _ from 'lodash';
import { Term } from '../../core/schemas/terms.schema';
import { PaginateDto } from '../../pagination/dto/paginate.dto';

export class ReportFilterDto extends PaginateDto {
	@Validate(EntryExistsRule, [
		User.name,
		({ curator_orcid }) => {
			return { orcid_id: curator_orcid };
		},
	])
	@IsOptional()
	curator_orcid?: string;

	@IsOptional()
	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return { resource_id };
		},
	])
	resource_id?: string;

	@Validate(EntryExistsRule, [
		Term.name,
		({ activity_terms, resource_id }) => {
			if (resource_id) {
				return { activity_term: { $in: activity_terms }, resource_id };
			}
			return { activity_term: { $in: activity_terms } };
		},
	])
	@ValidateIf((o) => o.activity_terms.length > 0)
	@IsOptional()
	activity_terms?: string[] = [];

	@IsOptional()
	entity_uri?: string;

	@Validate(DateBefore, ['to'])
	@MaxDate(() => new Date(), {
		message: 'maximal allowed date for $property is the current Date',
	})
	@IsOptional()
	@Transform(({ value }) => new Date(value))
	from?: Date;

	@Validate(DateAfter, ['from'])
	@MaxDate(() => new Date(), {
		message: 'maximal allowed date for $property is the current Date',
	})
	@IsOptional()
	@Transform(({ value }) => new Date(value))
	to?: Date;

	@IsIn([
		'timestamp',
		'resource_id',
		'entity_uri',
		'curator_orcid',
		'activity_term',
	])
	@IsOptional()
	sortBy?:
		| 'timestamp'
		| 'resource_id'
		| 'entity_uri'
		| 'curator_orcid'
		| 'activity_term' = 'timestamp';

	@IsIn([-1, 1])
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	sortOrder?: 1 | -1 = -1;

	@IsIn(['term', 'resource'], { each: true })
	@IsOptional()
	extend: ('term' | 'resource')[] = [];
}

export class ReportFilterGroupedDto extends ReportFilterDto {
	@IsIn(['day', 'month', 'activity_term'])
	@IsOptional()
	groupBy: 'day' | 'month' | 'activity_term';

	@Allow()
	sortBy?;
}

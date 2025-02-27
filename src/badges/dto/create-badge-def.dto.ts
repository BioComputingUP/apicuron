import {
	IsOptional,
	Matches,
	IsNotEmpty,
	Min,
	Validate,
	IsString,
	IsDate,
} from 'class-validator';
import { FilterQuery } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { Expose, Type } from 'class-transformer';
import {
	MaxDateField,
	MinDateField,
} from '../../medals/validators/date-comparison';
import { isSlug } from '../../shared/validators/is-slug.validator';

export class CreateBadgeDefDto {
	@IsOptional()
	@Expose()
	category: string;

	// matches that the color is either a hex code or bronze, gold or silver
	@Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
		message:
			'a badge color has to be either a color hexcode, "bronze", "gold" or "silver"',
	})
	@IsNotEmpty()
	@IsOptional()
	@Expose()
	color_code: string;

	@Min(1)
	@IsNotEmpty()
	@Expose()
	count_threshold: number;

	@isSlug()
	@IsString()
	@IsNotEmpty()
	@Expose()
	name: string;

	@IsNotEmpty()
	@Expose()
	displayedName: string;

	@Validate(ResourceIdExists)
	@IsNotEmpty()
	@Expose()
	resource_id: string;

	@Expose()
	@Validate(ActivityTermExists, [{ each: true }])
	@IsNotEmpty()
	@Expose()
	list_terms: string[];

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }): FilterQuery<PartnerResourceDocument> => {
			return {
				leagues: league,
				resource_id,
			};
		},
	])
	@IsString()
	@IsOptional()
	@Expose()
	league: string;

	@MaxDateField(['endDate'], true)
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	@Expose()
	startDate: Date;

	@MinDateField(['startDate'], true)
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	@Expose()
	endDate: Date;
}

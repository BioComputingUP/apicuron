import { Expose, Type } from 'class-transformer';
import {
	ArrayNotEmpty,
	IsBoolean,
	IsDate,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	Min,
	Validate,
	ValidateIf,
} from 'class-validator';
import { FilterQuery } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import {
	MaxDateField,
	MinDateField,
} from '../../medals/validators/date-comparison';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { isSlug } from '../../shared/validators/is-slug.validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';

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

	@ValidateIf((o) => !o.assignable)
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

	@ValidateIf((o) => !o.assignable)
	@Validate(ActivityTermExists, [{ each: true }])
	@IsNotEmpty({ each: true })
	@ArrayNotEmpty()
	@Expose()
	list_terms: string[];

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }): FilterQuery<PartnerResourceDocument> => {
			return {
				'leagues.name': league,
				resource_id,
			};
		},
	])
	@IsString()
	@IsOptional()
	@Expose()
	league: string;

	@ValidateIf((o) => !o.assignable)
	@MaxDateField(['endDate'], true)
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	@Expose()
	startDate: Date;

	@ValidateIf((o) => !o.assignable)
	@MinDateField(['startDate'], true)
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	@Expose()
	endDate: Date;

	@IsBoolean()
	@IsOptional()
	@Expose()
	assignable: boolean;
}

import {
	IsOptional,
	Matches,
	IsNotEmpty,
	Min,
	Validate,
	IsString,
} from 'class-validator';
import { FilterQuery } from 'mongoose';
import { BadgeUnique } from '../validators/achievement-exists';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';

export class CreateBadgeDefDto {
	@IsOptional()
	category: string;

	// matches that the color is either a hex code or bronze, gold or silver
	@Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
		message:
			'a badge color has to be either a color hexcode, "bronze", "gold" or "silver"',
	})
	@IsNotEmpty()
	color_code: string;

	@Min(1)
	@IsNotEmpty()
	count_threshold: number;

	@Validate(BadgeUnique)
	@IsNotEmpty()
	name: string;

	@Validate(ResourceIdExists)
	@IsNotEmpty()
	resource_id: string;

	@Validate(ActivityTermExists, [{ each: true }])
	@IsNotEmpty()
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
	league: string;
}

import { IsOptional, Matches, Min, Validate, IsString } from 'class-validator';
import { FilterQuery } from 'mongoose';
import { AchievementType } from '../../core/enums';
import { AchievementDef } from '../../core/schemas/achievements-def/achievement-def.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';

export class UpdateBadgeDefDto {
	// mandatory identifier fields
	@Validate(EntryExistsRule, [
		AchievementDef.name,
		({ name, resource_id, league }) => {
			return { name, resource_id, type: AchievementType.badge, league };
		},
	])
	@IsString()
	name: string;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return { resource_id };
		},
	])
	@IsString()
	resource_id: string;

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
	league: string;

	// optional update fields

	@IsOptional()
	category: string;

	// matches that the color is either a hex code or bronze, gold or silver
	@Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|bronze|gold|silver/, {
		message:
			'a badge color has to be either a color hexcode, "bronze", "gold" or "silver"',
	})
	@IsOptional()
	color_code: string;

	@Min(1)
	@IsOptional()
	count_threshold: number;

	@Validate(ActivityTermExists, [{ each: true }])
	@IsOptional()
	list_terms: string[];
}

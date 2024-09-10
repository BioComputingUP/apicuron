import {
	IsOptional,
	Matches,
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
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';
import { Type } from 'class-transformer';
import {
	MaxDateField,
	MinDateField,
} from '../../medals/validators/date-comparison';

export class UpdateBadgeDefDto {
	// mandatory identifier fields
	@Validate(EntryExistsRule, [
		BadgeDef.name,
		({ name, resource_id, league }) => {
			const q: FilterQuery<BadgeDefDocument> = { name, resource_id };
			if (league) {
				q.league = league;
			}
			return q;
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

	@MaxDateField(['endDate'])
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	startDate: Date;

	@MinDateField(['startDate'])
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	endDate: Date;
}

import {
	IsOptional,
	Matches,
	IsNotEmpty,
	Min,
	Validate,
	IsString,
	IsDate,
	IsNumber,
} from 'class-validator';
import { FilterQuery } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { Type } from 'class-transformer';
import { MaxDateField, MinDateField } from '../validators/date-comparison';
import { MedalDef } from '../../core/schemas/achievements-def/medal-def.schema';
import { UniqueRule } from '../../shared/validators/unique.validator';

export class CreateMedalDefDto {
	@Validate(UniqueRule, [
		MedalDef.name,
		({ name, resource_id }) => {
			return { name, resource_id };
		},
	])
	@IsString()
	@IsNotEmpty()
	name: string;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return { resource_id };
		},
	])
	@IsString()
	@IsNotEmpty()
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

	@Validate(ActivityTermExists, [{ each: true }])
	@IsNotEmpty()
	list_terms: string[];

	@Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
		message:
			'a medal color has to be either a color hexcode, "bronze", "gold" or "silver"',
	})
	@IsNotEmpty()
	@IsOptional()
	color: string;

	@Min(1)
	@IsNumber()
	@IsNotEmpty()
	score_relative: number;

	@MaxDateField(['last_day'], true)
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	first_day?: Date;

	@MinDateField(['first_day'], true)
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	last_day?: Date;
}

import {
	IsDate,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	Min,
	Validate,
} from 'class-validator';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { MedalUnique } from '../validators/achievement-exists';
import { MaxDateField, MinDateField } from '../validators/date-comparison';
import { Type } from 'class-transformer';
import { UniqueRule } from '../../shared/validators/unique.validator';
import { MedalDef } from '../../core/schemas/achievements-def/medal-def.schema';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';

export class CreateMedalDto {
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

	@Validate(ActivityTermExists, [{ each: true }])
	@IsNotEmpty()
	list_terms: string[];

	@Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
		message:
			'a medal color has to be either a color hexcode, "bronze", "gold" or "silver"',
	})
	@IsNotEmpty()
	color: string;

	@Min(1)
	@IsNumber()
	@IsNotEmpty()
	score_relative: number;

	@MaxDateField(['last_day'])
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	first_day?: Date;

	@MinDateField(['first_day'])
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	last_day?: Date;
}

export class MedalsFilter extends PaginateDto {
	static create(obj: any) {
		const filter = new MedalsFilter();
		Object.assign(filter, obj);
		return filter;
	}

	@MaxDateField(['last_day'])
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	first_day?: Date;

	@MinDateField(['first_day'])
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	last_day?: Date;

	@IsOptional()
	@IsString()
	@Validate(MedalUnique)
	name?: string;

	@IsOptional()
	@IsString()
	@Validate(ResourceIdExists)
	resource_id?: string;
}

export class DeleteMedalDefDto {
	@Validate(EntryExistsRule, [
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
}

export class UpdateMedalDefDto extends DeleteMedalDefDto {
	@Validate(ActivityTermExists, [{ each: true }])
	@IsOptional()
	list_terms: string[];

	@Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
		message:
			'a medal color has to be either a color hexcode, "bronze", "gold" or "silver"',
	})
	@IsOptional()
	color: string;

	@Min(1)
	@IsNumber()
	@IsNotEmpty()
	score_relative: number;

	@MaxDateField(['last_day'])
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	first_day: Date;

	@MinDateField(['first_day'])
	@IsDate()
	@IsOptional()
	@Type(() => Date)
	last_day: Date;
}

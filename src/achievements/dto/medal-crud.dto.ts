import {
	IsDate,
	IsDateString,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	MaxDate,
	Min,
	MinDate,
	Validate,
} from 'class-validator';
import * as _ from 'lodash';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { MedalUnique } from '../validators/achievement-exists';
import { MaxDateField, MinDateField } from '../validators/date-comparison';
import { Type } from 'class-transformer';

export class CreateMedalDto {
	// @IsNotEmpty()
	// @IsString()
	// category: string;

	@IsNotEmpty()
	@IsString()
	@Validate(MedalUnique)
	name: string;

	// @IsOptional()
	// resource_uri: string;

	@IsNotEmpty()
	@IsString()
	@Validate(ResourceIdExists)
	resource_id: string;

	@IsNotEmpty()
	@Validate(ActivityTermExists, [{ each: true }])
	list_terms: string[];

	@IsNotEmpty()
	@Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
		message:
			'a medal color has to be either a color hexcode, "bronze", "gold" or "silver"',
	})
	color: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(1)
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

export class DeleteMedalDto {
	@IsNotEmpty()
	@IsString()
	@Validate(MedalUnique, [{ reverse: true }])
	name: string;

	@IsNotEmpty()
	@IsString()
	@Validate(ResourceIdExists)
	resource_id: string;
}

export class UpdateMedalDto extends DeleteMedalDto {
	// @IsOptional()
	// @IsString()
	// category: string;

	@IsOptional()
	@Validate(ActivityTermExists, [{ each: true }])
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

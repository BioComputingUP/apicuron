import {
	IsOptional,
	Matches,
	Min,
	Validate,
	IsDate,
	IsNotEmpty,
	IsNumber,
} from 'class-validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { DeleteMedalDefDto } from './delete-medal-def.dto';
import { Type } from 'class-transformer';
import {
	MaxDateField,
	MinDateField,
} from '../validators/date-comparison';

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

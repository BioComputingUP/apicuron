import { Validate, IsOptional, IsString, IsDate } from 'class-validator';
import { BasePaginationDto } from '../../pagination/dto/paginate.dto';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { Type } from 'class-transformer';
import { MaxDateField, MinDateField } from '../validators/date-comparison';
import { MedalUnique } from '../validators/achievement-exists';
import { EntryExistsRule } from 'src/shared/validators/entry-exists.validator';
import { AchievementDef } from 'src/core/schemas/achievements-def/achievement-def.schema';
import { AchievementType } from 'src/core/enums';

export class MedalDefFilter extends BasePaginationDto {
	static create(obj: any) {
		const filter = new MedalDefFilter();
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
	@Validate(EntryExistsRule, [
		AchievementDef.name,
		({ name }) => {
			return { name, type: AchievementType.medal };
		},
	])
	name?: string;

	@IsOptional()
	@IsString()
	@Validate(ResourceIdExists)
	resource_id?: string;

	@IsOptional()
	@IsString()
	search_query?: string;
}

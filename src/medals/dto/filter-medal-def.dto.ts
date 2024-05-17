import { Validate, IsOptional, IsString, IsDate } from 'class-validator';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { Type } from 'class-transformer';
import { MaxDateField, MinDateField } from '../validators/date-comparison';
import { MedalUnique } from '../validators/achievement-exists';

export class MedalDefFilter extends PaginateDto {
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
	@Validate(MedalUnique)
	name?: string;

	@IsOptional()
	@IsString()
	@Validate(ResourceIdExists)
	resource_id?: string;
}

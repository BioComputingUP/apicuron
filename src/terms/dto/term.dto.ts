import {
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	IsUrl,
	Min,
	Validate,
} from 'class-validator';
import { BasePaginationDto } from '../../pagination/dto/paginate.dto';
import { Expose } from 'class-transformer';
import { PrivacyType } from '../../core/enums';

export class TermDto {
	// fields from Achievement

	// https://mongoosejs.com/docs/schematypes.html#schematype-options

	@Expose()
	@IsIn(['generation', 'invalidation', 'revision'])
	@IsNotEmpty()
	activity_category: string;

	@Expose()
	@IsNotEmpty()
	activity_name: string;

	@Expose()
	@IsNotEmpty()
	activity_term: string;

	@Expose()
	@IsNotEmpty()
	description: string;

	@Expose()
	@IsOptional()
	@IsUrl()
	resource_uri?: string;

	@Expose()
	@IsNotEmpty()
	resource_id: string;

	@Expose()
	@IsNotEmpty()
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0,
	})
	@Min(1)
	score: number;

	@Expose()
	league: string;

	@Expose()
	privacy: PrivacyType;
}

export class TermFilterDto extends BasePaginationDto {
	@IsString()
	@IsOptional()
	resource_id?: string;

	@IsIn(['generation', 'invalidation', 'revision'])
	@IsString()
	@IsOptional()
	activity_category?: string;

	@IsString()
	@IsOptional()
	activity_name?: string;

	@Min(1)
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0,
	})
	@IsOptional()
	score?: number;
}

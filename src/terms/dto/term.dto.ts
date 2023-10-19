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
import { PaginateDto } from '../../pagination/dto/paginate.dto';

export class TermDto {
	// fields from Achievement

	// https://mongoosejs.com/docs/schematypes.html#schematype-options

	@IsIn(['generation', 'invalidation', 'revision'])
	@IsNotEmpty()
	activity_category: string;

	@IsNotEmpty()
	activity_name: string;

	@IsNotEmpty()
	activity_term: string;

	@IsNotEmpty()
	description: string;

	@IsOptional()
	@IsUrl()
	resource_uri?: string;

	@IsNotEmpty()
	resource_id: string;

	@IsNotEmpty()
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0,
	})
	@Min(1)
	score: number;
}

export class TermFilterDto extends PaginateDto {
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

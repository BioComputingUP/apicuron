import {
	IsIn,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsUrl,
	Min,
	Validate,
} from 'class-validator';
import { ActivityTermExists } from '../validators/activity-term-exists';

export class CreateTermDto {
	// fields from Achievement

	// https://mongoosejs.com/docs/schematypes.html#schematype-options

	@IsIn(['generation', 'invalidation', 'revision'])
	@IsNotEmpty()
	activity_category: string;

	@IsNotEmpty()
	activity_name: string;

	// the second parameter is responsible for reversing the validator
	// when the first parameter of the validator constraint is true, the Activity term
	// is only valid when the ActivityTerm doesn't exist in the database
	@Validate(ActivityTermExists, [{ reverse: true }])
	@IsNotEmpty()
	activity_term: string;

	@IsNotEmpty()
	description: string;

	@IsUrl()
	@IsOptional()
	resource_uri?: string;

	@IsNotEmpty()
	resource_id: string;

	@Min(0)
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0,
	})
	@IsNotEmpty()
	score: number;
}

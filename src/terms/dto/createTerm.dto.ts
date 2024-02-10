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
import { ActivityTermExists } from '../validators/activity-term-exists';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTermDto {
	// fields from Achievement

	// https://mongoosejs.com/docs/schematypes.html#schematype-options

	@ApiProperty({
		description:
			'Defines the category of the activity, either generation (creating new data), revision (updating data) or invalidation (rendering invalid old data)',
	})
	@IsIn(['generation', 'invalidation', 'revision'])
	@IsString()
	@IsNotEmpty()
	activity_category: string;

	@ApiProperty({
		description:
			'The name of the activity, this field will be displayed publicly on the APICURON website and will be used to distinguish between activities for Users',
	})
	@IsString()
	@IsNotEmpty()
	activity_name: string;

	// the second parameter is responsible for reversing the validator
	// when the first parameter of the validator constraint is true, the Activity term
	// is only valid when the ActivityTerm doesn't exist in the database
	@ApiProperty({
		description:
			'This field will serve as an ID that represents the activity, will be used to assign the activity to users when sending curation reports',
	})
	@Validate(ActivityTermExists, [{ reverse: true }])
	@IsNotEmpty()
	activity_term: string;

	@ApiProperty({
		description:
			'Short text describing the activity, explaining briefly what the contributor needs to do to perform this activity',
	})
	@IsString()
	@IsNotEmpty()
	description: string;

	@IsUrl()
	@IsOptional()
	resource_uri?: string;

	@ApiProperty({
		description:
			'The resource_id of the concerned resource that tracks this activity',
	})
	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return { resource_id };
		},
	])
	@IsString()
	@IsNotEmpty()
	resource_id: string;

	@ApiProperty({
		description:
			'The associated score of this activity representing the value of the activity',
	})
	@Min(0)
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0,
	})
	@IsNotEmpty()
	score: number;
}

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

export class UpdateTermDto {
	// fields from Achievement

	// https://mongoosejs.com/docs/schematypes.html#schematype-options

	@IsIn(['generation', 'invalidation', 'revision'])
	@IsOptional()
	activity_category?: string;

	@IsOptional()
	activity_name?: string;

	// the second parameter is responsible for reversing the validator
	// when the first parameter of the validator constraint is true, the Activity term
	// is only valid when the ActivityTerm doesn't exist in the database
	@Validate(ActivityTermExists)
	@IsNotEmpty()
	activity_term: string;

	@IsOptional()
	description?: string;

	@IsOptional()
	@IsUrl()
	resource_uri?: string;

	@IsNotEmpty()
	resource_id: string;

	@Min(1)
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0,
	})
	@IsOptional()
	score?: number;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }) => {
			return {
				leagues: league,
				resource_id,
			};
		},
	])
	@IsString()
	@IsOptional()
	league: string;
}

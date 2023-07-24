import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min, Validate } from "class-validator";
import { ActivityTermExists } from "../validators/activity-term-exists";


export class UpdateTermDto {
	// fields from Achievement
	
	// https://mongoosejs.com/docs/schematypes.html#schematype-options
	
    @IsOptional()
	@IsIn(['generation', 'invalidation', 'revision'])
	activity_category?: string;
	
	@IsOptional()
	activity_name?: string;
	
	@IsNotEmpty()
    // the second parameter is responsible for reversing the validator
    // when the first parameter of the validator constraint is true, the Activity term 
    // is only valid when the ActivityTerm doesn't exist in the database
	@Validate(ActivityTermExists)
	activity_term?: string;
	
	@IsOptional()
	description?: string;
	
	@IsOptional()
	@IsUrl()
	resource_uri?: string;
	
	@IsNotEmpty()
	resource_id?: string;

	@IsOptional()
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0
	})
	@Min(1)
	score?: number;
}

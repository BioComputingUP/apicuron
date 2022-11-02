import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min, Validate } from "class-validator";
import { ActivityTermExists } from "../terms/validators/activity-term-exists";


export class CreateTermDto {
	// fields from Achievement
	
	// https://mongoosejs.com/docs/schematypes.html#schematype-options
	
	@IsNotEmpty()
	@IsIn(['generation', 'invalidation', 'revision'])
	activity_category: string;
	
	@IsNotEmpty()
	activity_name: string;
	
	@IsNotEmpty()
    // the second parameter is responsible for reversing the validator
    // when the first parameter of the validator constraint is true, the Activity term 
    // is only valid when the ActivityTerm doesn't exist in the database
	@Validate(ActivityTermExists, [{ reverse: true}])
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
		maxDecimalPlaces: 0
	})
	@Min(1)
	score: number;
}

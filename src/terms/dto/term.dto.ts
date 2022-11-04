import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min, Validate } from "class-validator";
import { ActivityTermExists } from "../validators/activity-term-exists";


export class TermDto {
	// fields from Achievement
	
	// https://mongoosejs.com/docs/schematypes.html#schematype-options
	
	@IsNotEmpty()
	@IsIn(['generation', 'invalidation', 'revision'])
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
		maxDecimalPlaces: 0
	})
	@Min(1)
	score: number;
}

export class TermFilterDto {
	
	@IsOptional()
	resource_id?: string;

	@IsOptional()
	@IsIn(['generation', 'invalidation', 'revision'])
	activity_category?: string;

	@IsOptional()
	activity_name?: string;

	@IsOptional()
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0
	})
	@Min(1)
	score?: number;
}

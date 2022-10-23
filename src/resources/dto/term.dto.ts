import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsUrl, Min } from "class-validator";


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

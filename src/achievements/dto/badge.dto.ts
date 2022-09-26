import { IsNotEmpty } from 'class-validator';

export class BadgeDto {
	@IsNotEmpty()
	name: string;
    
	@IsNotEmpty()
	resource_uri: string;
    
	@IsNotEmpty()
	category: string;
    
	@IsNotEmpty()
	color_code: string;
    
	@IsNotEmpty()
	count_threshold: number;
    
	@IsNotEmpty()
	list_terms: [string];
    
	@IsNotEmpty()
	type: string;
    
}

import { IsInt } from "class-validator";

export class BadgeDto {
	// fields from Achievement
	

	category: string;

	color: string;
    
    @IsInt()
	count_threshold: number;

	name: string;
	resource_uri: string;
	list_terms: string[];

	// Fields specific to Medal

	color_code: string;
}
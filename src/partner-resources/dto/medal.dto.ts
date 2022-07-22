import { IsInt } from "class-validator";

export class MedalDto {
	// fields from Achievement

	category: string;

	color: string;
	
	count_threshold: number;

	name: string;
	resource_uri: string;
	list_terms: string[];

	// Fields specific to Medal

    @IsInt()
	score_relative: number;

	first_day: Date;
	
	last_day: Date;
}
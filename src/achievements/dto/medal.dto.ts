import { IsNotEmpty } from 'class-validator';

export class MedalDto {
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	resource_uri: string;

	@IsNotEmpty()
	category: string;

	@IsNotEmpty()
	color: string;

	@IsNotEmpty()
	first_day: string;

	@IsNotEmpty()
	last_day: string;

	@IsNotEmpty()
	list_terms: [string];

	@IsNotEmpty()
	score_relative: number;

	@IsNotEmpty()
	type: string;
}

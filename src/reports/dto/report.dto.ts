import { IsNotEmpty } from 'class-validator';
export class ReportDto {
	@IsNotEmpty()
	activity_term: string;

	@IsNotEmpty()
	curator_orcid: string;

	@IsNotEmpty()
	entity_uri: string;

	@IsNotEmpty()
	resource_id: string;

	@IsNotEmpty()
	timestamp: Date;
}

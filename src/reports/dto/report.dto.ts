import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
export class ReportDto {

    @IsNotEmpty()
    activity_term: string;

    @IsNotEmpty()
	curator_orcid: string;

    @IsNotEmpty()
	entity_uri: string;

    @IsNotEmpty()
	resource_uri: string;

    @IsNotEmpty()
	timestamp: Date;

}

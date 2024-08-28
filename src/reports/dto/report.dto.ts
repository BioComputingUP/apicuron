import { IsNotEmpty } from 'class-validator';
import { TermDto } from '../../terms/dto/term.dto';
import { Expose, Type } from 'class-transformer';
import { PrivacyType } from '../../core/enums';
export class ReportDto {
	@Expose()
	@IsNotEmpty()
	activity_term: string;

	@Expose()
	@IsNotEmpty()
	curator_orcid: string;

	@Expose()
	@IsNotEmpty()
	entity_uri: string;

	@Expose()
	@IsNotEmpty()
	resource_id: string;

	@Expose()
	@IsNotEmpty()
	timestamp: Date;

	@Expose()
	resource_uri: string;

	@Expose()
	privacy: PrivacyType;

	@Expose()
	league: string;
}

export class ReportWithTermDto extends ReportDto {
	@Expose()
	@Type(() => TermDto)
	term: TermDto;
}

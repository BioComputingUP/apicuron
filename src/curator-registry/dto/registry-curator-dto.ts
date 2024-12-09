import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RegistryCurator {
	@ApiProperty()
	@Expose()
	displayedName: string;

	@ApiProperty()
	@Expose()
	orcid_id: string;

	@ApiProperty()
	@Expose()
	affiliation: string;

	@ApiProperty()
	@Expose()
	avatar: string;
}

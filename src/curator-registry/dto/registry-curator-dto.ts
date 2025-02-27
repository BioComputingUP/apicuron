import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { StorageReference } from 'src/shared/decorators';

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
	@StorageReference()
	avatar: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
	@ApiProperty()
	gmail?: string;

	@ApiProperty()
	orcid_id: string;

	@ApiProperty()
	biography?: string;

	@ApiProperty()
	displayedName: string;

	@ApiProperty()
	email?: string;

	@ApiProperty()
	employment?: string;

	@ApiProperty()
	family_name?: string;
	@ApiProperty()
	given_name?: string;

	@ApiProperty()
	full_name: string;

	@ApiProperty()
	institution?: string;

	@ApiProperty()
	keywords?: string;

	@ApiProperty()
	username?: string;
}

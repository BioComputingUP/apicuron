import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserEntity {
	@ApiProperty()
	gmail?: string;

	@ApiProperty()
	@Expose()
	orcid_id: string;

	@ApiProperty()
	biography?: string;

	@ApiProperty()
	@Expose()
	displayedName: string;

	@ApiProperty()
	email?: string;

	@ApiProperty()
	employment?: string;

	@ApiProperty()
	@Expose()
	family_name?: string;

	@ApiProperty()
	@Expose()
	given_name?: string;

	@ApiProperty()
	@Expose()
	full_name?: string;

	@ApiProperty()
	institution?: string;

	@ApiProperty()
	keywords?: string;

	@ApiProperty()
	username?: string;

	@Expose()
	avatar: string;
}

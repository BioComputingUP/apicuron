import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { StorageReference } from 'src/shared/decorators/storage-reference.decorator';
import { UserResourcePutCode } from '../../../core/interfaces/user-resource-put-code';
import { UserResource } from '../../../core/interfaces/user-resource';
import { UserEmailEntry } from '../../../core/schemas/components/user-email.schema';
import { UserLinks } from '../../../core/interfaces/user-employment';

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

	@StorageReference()
	@Expose()
	avatar: string;
}

export class PrivateUserEntity {
	@Expose()
	resources: UserResource[];

	@Expose()
	isNewLogin: boolean;

	@Expose()
	affiliation?: string;

	@Expose()
	contributedTo: UserResource[];

	@Expose()
	emails: UserEmailEntry[];

	@Expose()
	employment?: string | string[];

	@Expose()
	links: UserLinks[];

	@ApiProperty()
	@Expose()
	gmail?: string;

	@ApiProperty()
	@Expose()
	orcid_id: string;

	@ApiProperty()
	@Expose()
	biography?: string;

	@ApiProperty()
	@Expose()
	displayedName: string;

	@ApiProperty()
	@Expose()
	email?: string;

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
	@Expose()
	institution?: string;

	@ApiProperty()
	@Expose()
	keywords?: string;

	@ApiProperty()
	@Expose()
	username?: string;

	@Expose()
	@StorageReference()
	avatar: string;

	@Exclude()
	orcid_permission: string;

	@Exclude()
	orcid_scope: string;

	@Exclude()
	orcid_work_put_codes: UserResourcePutCode[];

	@Exclude()
	refresh_token: string;
}

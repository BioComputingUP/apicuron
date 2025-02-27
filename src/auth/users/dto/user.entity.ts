import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { StorageReference } from 'src/shared/decorators/storage-reference.decorator';
import { UserResourcePutCode } from '../../../core/interfaces/user-resource-put-code';
import { UserResource } from '../../../core/interfaces/user-resource';
import { UserEmailEntry } from '../../../core/schemas/components/user-email.schema';
import { UserLinks } from "src/core/schemas/components/user-fields.schema";
import { PrivacyType } from 'src/core/enums';

/**
 * Represents a user entity with various properties related to user information and authentication. But filters sensitive fields.
 */
export class UserEntity {
	@ApiProperty()
	gmail?: string;

	@Expose()
	privacy: PrivacyType;

	@Expose()
	@Type(() => UserResource)
	@Transform((params) => params.value ?? [], { toClassOnly: true })
	resources: UserResource[];

	@Expose()
	affiliation?: string;

	@Expose()
	@Type(() => UserLinks)
	links: UserLinks[];

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
	email?: string;

	@ApiProperty()
	@Expose()
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
	@Expose()
	keywords?: string;

	@ApiProperty()
	username?: string;

	@StorageReference()
	@Expose()
	avatar: string;


	@Exclude()
	orcid_permission: string;

	@Exclude()
	orcid_scope: string;

	@Exclude()
	@Type(() => UserResourcePutCode)
	@Transform((params) => params.value ?? [], { toClassOnly: true })
	orcid_work_put_codes: UserResourcePutCode[];

	@Exclude()
	refresh_token: string;
}

/**
 * Represents a private user entity (meaning that it does not filter sensitive fields) with various properties related to user information and authentication.
 */
export class PrivateUserEntity {
	

	@Expose()
	isNewLogin: boolean;

	@Expose()
	affiliation?: string;

	@Expose()
	@Type(() => UserResource)
	@Transform((params) => params.value ?? [], { toClassOnly: true })
	contributedTo: UserResource[];

	@Expose()
	privacy: PrivacyType;

	@Expose()
	@Type(() => UserResource)
	@Transform((params) => params.value ?? [], { toClassOnly: true })
	resources: UserResource[];

	@Expose()
	emails: UserEmailEntry[];

	@Expose()
	employment?: string | string[];

	@Expose()
	@Type(() => UserLinks)
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

	@Expose()
	orcid_permission: string;

	@Expose()
	orcid_scope: string;

	@Expose()
	orcid_work_put_codes: UserResourcePutCode[];

	@Expose()
	refresh_token: string;
}

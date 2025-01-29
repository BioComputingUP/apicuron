import {
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	Validate,
	IsBoolean,
} from 'class-validator';
import { User } from '../../../core/schemas/user.schema';
import { OrcidChecksum } from '../../../submit-reports/validators/orcid-checksum';
import { EntryExistsRule } from '../../../shared/validators/entry-exists.validator';
import { UserEmailEntry } from 'src/core/schemas/components/user-email.schema';
export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	gmail?: string;

	@IsNotEmpty()
	orcid_id: string;

	biography?: string;

	displayedName: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	// @IsOptional()
	// employment?: string;

	family_name?: string;
	given_name?: string;

	full_name: string;

	institution?: string;

	// keywords?: string;

	username?: string;
}

export class UpdateProfileDto {
	@Validate(EntryExistsRule, [
		User.name,
		({ orcid_id }) => {
			return {
				orcid_id,
			};
		},
	])
	@Validate(OrcidChecksum)
	@IsNotEmpty()
	orcid_id: string;

	@IsOptional()
	email: UserEmailEntry;

	@IsIn(['private', 'public'])
	@IsString()
	@IsOptional()
	privacy: 'private' | 'public';

	@IsOptional()
	@IsBoolean()
	isNewLogin: boolean;

	@IsOptional()
	@IsBoolean()
	acceptsEmails: boolean;
}

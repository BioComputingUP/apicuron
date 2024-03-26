import {
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	Validate,
} from 'class-validator';
import { User } from '../../../core/schemas/user.schema';
import { OrcidChecksum } from '../../../submit-reports/validators/orcid-checksum';
import { EntryExistsRule } from '../../../shared/validators/entry-exists.validator';
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

	@IsEmail()
	@IsString()
	@IsOptional()
	email: string;

	@IsIn(['private', 'public'])
	@IsString()
	@IsOptional()
	privacy: 'private' | 'public';
}

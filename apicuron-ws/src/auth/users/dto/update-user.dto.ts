import { Type } from 'class-transformer';
import {
	IsBoolean,
	IsEmail,
	IsEnum,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	Validate,
	ValidateNested,
} from 'class-validator';
import { VisibilityType } from 'src/core/enums';
import { User } from '../../../core/schemas/user.schema';
import { EntryExistsRule } from '../../../shared/validators/entry-exists.validator';
import { OrcidChecksum } from '../../../submit-reports/validators/orcid-checksum';

export class EmailDto {
	@IsEmail()
	@IsString()
	@IsNotEmpty()
	email: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum(VisibilityType)
	visibility: VisibilityType;

	@IsNotEmpty()
	@IsBoolean()
	primary: boolean;
}

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

	@ValidateNested({ each: true })
	@Type(() => EmailDto)
	@IsOptional()
	emails: EmailDto[];

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

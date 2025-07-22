import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateUserDto {
	@IsString()
	@IsEmail()
	@IsOptional()
	gmail?: string;

	@IsNotEmpty()
	orcid_id: string;

	biography?: string;

	@IsString()
	@IsNotEmpty()
	displayedName: string;

	@IsString()
	@IsEmail()
	@IsOptional()
	email?: string;

	employment?: string;

	family_name?: string;
	given_name?: string;

	full_name: string;

	institution?: string;

	keywords?: string;

	username?: string;
}

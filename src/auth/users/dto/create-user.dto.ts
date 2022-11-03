import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateUserDto {
  @IsOptional()
  @IsString() 
  @IsEmail()
  gmail?: string;

  @IsNotEmpty()
  orcid_id: string;

  biography?: string;

  @IsNotEmpty()
  @IsString()
  displayedName: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  employment?: string;

  family_name?: string;
  given_name?: string;

  full_name: string;

  institution?: string;

  keywords?: string;

  username?: string;
}

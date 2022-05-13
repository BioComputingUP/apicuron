import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
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

  @IsOptional()
  employment?: string;

  family_name?: string;
  given_name?: string;

  full_name: string;

  institution?: string;

  keywords?: string;

  username?: string;
  
}

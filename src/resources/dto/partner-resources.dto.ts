import { Allow, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { LeagueDto } from '../partner-resources/leagues/dto/league.dto';
export class SelectPartnerResourceDto {
	@IsString()
	@IsNotEmpty()
	resource_id: string;
}
export class PartnerResourceDto extends SelectPartnerResourceDto {
	@IsNotEmpty()
	@IsString()
	resource_description: string;

	// @IsNotEmpty()
	// @IsString()
	// resource_id: string;

	@IsString()
	@IsNotEmpty()
	resource_long_name: string;

	@IsString()
	@IsNotEmpty()
	resource_name: string;

	@IsString()
	@IsNotEmpty()
	resource_uri: string;

	@IsUrl()
	@IsString()
	@IsNotEmpty()
	resource_url: string;

	@IsNotEmpty()
	@IsString()
	logo: string;

	@IsNotEmpty()
	leagues: LeagueDto[];

	@IsNotEmpty()
	@IsString()
	defaultLeague: string;
}

import { Allow, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { LeagueDto } from '../partner-resources/leagues/dto/league.dto';
import { Expose } from 'class-transformer';
export class SelectPartnerResourceDto {
	@IsString()
	@IsNotEmpty()
	resource_id: string;
}
export class PartnerResourceDto extends SelectPartnerResourceDto {
	@IsNotEmpty()
	@IsString()
	@Expose()
	resource_description: string;

	// @IsNotEmpty()
	// @IsString()
	// resource_id: string;

	@IsString()
	@IsNotEmpty()
	@Expose()
	resource_long_name: string;

	@IsString()
	@IsNotEmpty()
	@Expose()
	resource_name: string;

	@IsString()
	@IsNotEmpty()
	@Expose()
	resource_uri: string;

	@IsUrl()
	@IsString()
	@IsNotEmpty()
	@Expose()
	resource_url: string;

	@Expose()
	joined_date: Date;

	@IsNotEmpty()
	@IsString()
	@Expose()
	logo: string;

	@IsNotEmpty()
	@Expose()
	leagues: LeagueDto[];

	@IsNotEmpty()
	@IsString()
	@Expose()
	defaultLeague: string;
}

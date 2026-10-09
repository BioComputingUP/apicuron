import { Expose, Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ResourceCategory } from 'src/core/enums';
import { StorageReference } from 'src/shared/decorators/storage-reference.decorator';
import { LeagueEntity } from '../partner-resources/leagues/dto/league.dto';
import { LeaderboardSettingsDto } from './leaderboard-settings.dto';
import { ResourceStatsDto } from './resource-stat.dto';
export class SelectPartnerResourceDto {
	@IsString()
	@IsNotEmpty()
	@Expose()
	resource_id: string;
}
export class PartnerResourceEntity extends SelectPartnerResourceDto {
	@Expose()
	color: string;

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

	@IsEnum(ResourceCategory)
	@Expose()
	category: ResourceCategory;

	@IsNotEmpty()
	@IsString()
	@StorageReference()
	@Expose()
	logo: string;

	@IsNotEmpty()
	@Expose()
	@Type(() => LeagueEntity)
	leagues: LeagueEntity[];

	@IsNotEmpty()
	@IsString()
	@Expose()
	defaultLeague: string;

	@Expose()
	@Type(() => ResourceStatsDto)
	stats: ResourceStatsDto;

	@Expose()
	@Type(() => LeaderboardSettingsDto)
	leaderboard_preferences: LeaderboardSettingsDto;
}

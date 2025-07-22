import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { LeagueEntity } from '../partner-resources/leagues/dto/league.dto';
import {
	Expose,
	plainToClassFromExist,
	plainToInstance,
	Type,
} from 'class-transformer';
import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import { PartnerResourceDocument } from '../../core/schemas';
import { StorageType } from '../../storage/storage.config';
import { StorageReference } from 'src/shared/decorators/storage-reference.decorator';
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
}

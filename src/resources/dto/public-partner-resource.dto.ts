import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { SelectPartnerResourceDto } from './partner-resources.entity';
import { ResourceStatsDto } from './resource-stat.dto';
import { StorageReference } from 'src/shared/decorators/storage-reference.decorator';

export class PublicPartnerResourceDto extends SelectPartnerResourceDto {
	@IsNotEmpty()
	@IsString()
	@Expose()
	resource_description: string;

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
	resource_id: string;

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
	@Type(() => ResourceStatsDto)
	@Expose()
	stats: ResourceStatsDto;
}

import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { SelectPartnerResourceDto } from './partner-resources.entity';
import { ResourceStatsDto } from './resource-stat.dto';
import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';

export class PublicPartnerResourceDto extends SelectPartnerResourceDto {
	private constructor() {
		super();
	}

	static async fromDocument(
		document: any,
		storage: StorageService,
	): Promise<PublicPartnerResourceDto> {
		const entity = new PublicPartnerResourceDto();
		entity.resource_description = document.resource_description;
		entity.resource_id = document.resource_id;
		entity.resource_long_name = document.resource_long_name;
		entity.resource_name = document.resource_name;
		entity.resource_uri = document.resource_uri;
		entity.resource_url = document.resource_url;
		entity.joined_date = document.joined_date;
		entity.logo = await storage.getPublicUrl(document.logo);
		entity.stats = ResourceStatsDto.fromDocument(document.stats);

		return entity;
	}

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
	@Expose()
	logo: string;

	@IsNotEmpty()
	@Type(() => ResourceStatsDto)
	@Expose()
	stats: ResourceStatsDto;
}

import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { LeagueEntity } from '../partner-resources/leagues/dto/league.dto';
import {
	Expose,
	plainToClassFromExist,
	plainToInstance,
} from 'class-transformer';
import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import { PartnerResourceDocument } from '../../core/schemas';
import { StorageType } from '../../storage/storage.config';
export class SelectPartnerResourceDto {
	@IsString()
	@IsNotEmpty()
	resource_id: string;
}
export class PartnerResourceEntity extends SelectPartnerResourceDto {
	static async fromDocument(
		document: PartnerResourceDocument,
		storage: StorageService,
	): Promise<PartnerResourceEntity> {
		const plainEntity = new PartnerResourceEntity();
		const entity = plainToClassFromExist(plainEntity, document);

		entity.logo = await storage.getPublicUrl(
			StorageType.public,
			entity.logo.replace('public/', ''),
		);

		return entity;
	}
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
	leagues: LeagueEntity[];

	@IsNotEmpty()
	@IsString()
	@Expose()
	defaultLeague: string;
}

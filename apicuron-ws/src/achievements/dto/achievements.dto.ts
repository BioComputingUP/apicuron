import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { OrcidExists } from '../../auth/validators/orcidExists.dto';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { Expose } from 'class-transformer';
import { BadgeDto } from '../../badges/dto/badge.dto';
import { ApiProperty } from '@nestjs/swagger';
import { MedalDto } from '../../medals/dto/medal.dto';

export class AchievementSelectDto {
	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return { resource_id };
		},
	])
	@IsString()
	@IsNotEmpty()
	@Expose()
	resource_id: string;

	@Validate(OrcidExists)
	@IsString()
	@IsNotEmpty()
	@Expose()
	orcid_id: string;
}

export class UserAchievements {
	@ApiProperty({
		type: [BadgeDto],
	})
	badges: BadgeDto[];

	@ApiProperty({
		type: [MedalDto],
	})
	medals: MedalDto[];
}

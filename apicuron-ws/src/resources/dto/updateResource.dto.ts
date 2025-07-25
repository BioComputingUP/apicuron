import { ApiProperty } from '@nestjs/swagger';
import {
	IsEmpty,
	IsNotEmpty,
	IsOptional,
	IsString,
	IsUrl,
	Matches,
	MaxLength,
	Validate,
	ValidateNested,
} from 'class-validator';
import { FilterQuery } from 'mongoose';

import { Type } from 'class-transformer';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { LeaderboardSettingsDto } from './leaderboard-settings.dto';

export class UpdatePartnerResourceDto {
	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => ({ resource_id }),
	])
	@IsString()
	@Matches(/^([a-z0-9-]|\-|\_)+$/)
	@IsNotEmpty()
	resource_id: string;

	@IsString()
	@IsOptional()
	resource_description: string;

	@MaxLength(60)
	@IsString()
	@IsOptional()
	resource_long_name: string;

	@MaxLength(20)
	@IsString()
	@IsOptional()
	resource_name: string;

	@IsUrl()
	@IsString()
	@IsOptional()
	resource_url: string;

	@IsEmpty()
	@ApiProperty({ type: 'file', format: 'jpeg/png/svg' })
	logo: string;

	@Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: 'The resource color has to be a color hexcode',
	})
	@IsString()
	@IsOptional()
	color: string;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ defaultLeague, resource_id }): FilterQuery<PartnerResourceDocument> => ({
			resource_id,
			'leagues.name': defaultLeague,
		}),
	])
	@IsString()
	@IsOptional()
	defaultLeague: string;

	@IsOptional()
	@ValidateNested()
	@Type(() => LeaderboardSettingsDto)
	leaderboardPreferences?: LeaderboardSettingsDto;
}

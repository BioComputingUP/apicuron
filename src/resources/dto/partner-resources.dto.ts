import { Allow, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { BadgeDto } from '../../achievements/dto/badge.dto';
import { MedalDto } from '../../achievements/dto/medal.dto';
import { TermDto } from '../../terms/dto/term.dto';

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
}

export class PartnerResourceSummaryDto extends PartnerResourceDto {
	@Allow()
	badges: BadgeDto[];
	@Allow()
	medals: MedalDto[];
	@Allow()
	terms: TermDto[];
}

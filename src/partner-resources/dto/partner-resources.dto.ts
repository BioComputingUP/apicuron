import { IsNotEmpty, IsUrl } from 'class-validator';
import { BadgeDocument } from '../schemas/badges.schema';
import { BadgeDto } from './badge.dto';
import { MedalDto } from './medal.dto';
import { TermDto } from './term.dto';
export class PartnerResourceDto {

	resource_description: string;

    @IsNotEmpty()
	resource_id: string;

	resource_long_name: string;

    @IsNotEmpty()
	resource_name: string;

    @IsNotEmpty()
	resource_uri: string;

    @IsNotEmpty()
	resource_url: string;

}


export class PartnerResourceSummaryDto extends PartnerResourceDto {

    badges:BadgeDto[]
    medals:MedalDto[]
    terms:TermDto[]

}
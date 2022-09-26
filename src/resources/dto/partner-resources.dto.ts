import { IsNotEmpty, IsUrl } from 'class-validator';
import { BadgeDto } from '../../achievements/dto/badge.dto';
import { MedalDto } from '../../achievements/dto/medal.dto';
import { TermDto } from './term.dto';
export class PartnerResourceDto {

	resource_description: string;

    @IsNotEmpty()
	resource_id: string;

	resource_long_name: string;

    @IsNotEmpty()
	resource_name: string;

    @IsNotEmpty()
    @IsUrl()
	resource_uri: string;

    @IsNotEmpty()
    @IsUrl()
	resource_url: string;

}


export class PartnerResourceSummaryDto extends PartnerResourceDto {

    badges:BadgeDto[]
    medals:MedalDto[]
    terms:TermDto[]

}
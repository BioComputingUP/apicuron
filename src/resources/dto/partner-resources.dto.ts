import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { BadgeDto } from '../../achievements/dto/badge.dto';
import { MedalDto } from '../../achievements/dto/medal.dto';
import { TermDto } from '../../terms/dto/term.dto';

export class SelectPartnerResourceDto {
    @IsNotEmpty()
    @IsString()
	resource_id: string;
}
export class PartnerResourceDto extends SelectPartnerResourceDto {

    @IsNotEmpty()
    @IsString()
	resource_description: string;

    // @IsNotEmpty()
    // @IsString()
	// resource_id: string;

    @IsNotEmpty()
    @IsString()
	resource_long_name: string;

    @IsNotEmpty()
    @IsString()
    resource_name: string;

    @IsNotEmpty()
    @IsString()
    resource_uri: string;

    @IsNotEmpty()
    @IsString()
    @IsUrl()
	resource_url: string;

    @IsNotEmpty()
    @IsString()
	logo: string;

}


export class PartnerResourceSummaryDto extends PartnerResourceDto {

    badges:BadgeDto[]
    medals:MedalDto[]
    terms:TermDto[]

}
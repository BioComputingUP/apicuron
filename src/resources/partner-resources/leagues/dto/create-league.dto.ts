import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	Validate
} from 'class-validator';
import { OrcidChecksum } from '../../../../submit-reports/validators/orcid-checksum';
import { PrivacyType } from '../../../../core/enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeagueDto {
	@Validate(OrcidChecksum, { each: true })
	@IsString({ each: true })
	@IsArray()
	@IsOptional()
	defaultMembers: string[];

	@IsString()
	@IsNotEmpty()
	resource_id: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	displayedName: string;

	@ApiProperty({
		enum: PrivacyType,
		example: PrivacyType.public,
		description: 'The visibility of the league',
	})
	@IsEnum(PrivacyType)
	@IsString()
	@IsNotEmpty()
	visibility: PrivacyType;
}

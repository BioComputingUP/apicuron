import {
	Validate,
	IsString,
	IsArray,
	IsOptional,
	IsNotEmpty,
	IsEnum,
} from 'class-validator';
import { PrivacyType } from '../../../../core/enums';
import { OrcidChecksum } from '../../../../submit-reports/validators/orcid-checksum';

export class UpdateLeagueDto {
	@Validate(OrcidChecksum, { each: true })
	@IsString({ each: true })
	@IsArray()
	@IsOptional()
	defaultMembers?: string[];

	@IsString()
	@IsNotEmpty()
	resource_id: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsOptional()
	displayedName?: string;

	@IsEnum(PrivacyType)
	@IsString()
	@IsOptional()
	visibility?: PrivacyType;
}

import {
	IsArray,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	Validate,
} from 'class-validator';
import { OrcidChecksum } from '../../../submit-reports/validators/orcid-checksum';
import { UniqueRule } from '../../../shared/validators/unique.validator';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../../core/schemas/resource/partner-resource.schema';
import { FilterQuery } from 'mongoose';
import { PrivacyType } from '../../../core/enums';
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

	@Validate(UniqueRule, [
		PartnerResource.name,
		({ name, resource_id }): FilterQuery<PartnerResourceDocument> => {
			return {
				resource_id,
				leagues: {
					$elemMatch: { name },
				},
			};
		},
	])
	@IsString()
	@IsNotEmpty()
	name: string;

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

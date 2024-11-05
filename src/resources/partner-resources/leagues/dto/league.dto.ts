import { ApiProperty } from '@nestjs/swagger';
import {
	Validate,
	IsString,
	IsArray,
	IsOptional,
	IsNotEmpty,
	IsEnum,
} from 'class-validator';
import { FilterQuery } from 'mongoose';
import { PrivacyType } from '../../../../core/enums';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../../../core/schemas/resource/partner-resource.schema';
import { UniqueRule } from '../../../../shared/validators/unique.validator';
import { OrcidChecksum } from '../../../../submit-reports/validators/orcid-checksum';
import { Expose } from 'class-transformer';

export class LeagueDto {
	@Validate(OrcidChecksum, { each: true })
	@IsString({ each: true })
	@IsArray()
	@IsOptional()
	@Expose()
	defaultMembers: string[];

	@IsString()
	@Expose()
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
	@Expose()
	name: string;

	@IsString()
	@IsNotEmpty()
	@Expose()
	displayedName: string;

	@ApiProperty({
		enum: PrivacyType,
		example: PrivacyType.public,
		description: 'The visibility of the league',
	})
	@IsEnum(PrivacyType)
	@IsString()
	@IsNotEmpty()
	@Expose()
	visibility: PrivacyType;
}

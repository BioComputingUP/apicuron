import { Validate, IsString, IsNotEmpty } from 'class-validator';
import { FilterQuery } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../../../core/schemas/resource/partner-resource.schema';
import { UniqueRule } from '../../../../shared/validators/unique.validator';
import { OrcidChecksum } from '../../../../submit-reports/validators/orcid-checksum';

export class DeleteMemberFromLeagueDTO {
	@Validate(UniqueRule, [
		PartnerResource.name,
		({ resource_id, member }): FilterQuery<PartnerResourceDocument> => {
			return {
				leagues: { $elemMatch: { defaultMembers: member } },
				resource_id,
			};
		},
	])
	@Validate(OrcidChecksum)
	@IsString()
	member: string;

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
	league: string;
}

import { Validate, IsString } from 'class-validator';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { OrcidChecksum } from '../../submit-reports/validators/orcid-checksum';

export class DetailedStatisticsFilter {
	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return { resource_id };
		},
	])
	@IsString()
	resource_id: string;

	@Validate(OrcidChecksum)
	@IsString()
	curator_orcid: string;
}

export class DetailedStatisticsIdentifier extends DetailedStatisticsFilter {
	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }) => {
			return {
				resource_id,
				leagues: {
					$elemMatch: { name: league },
				},
			};
		},
	])
	@IsString()
	league: string;
}

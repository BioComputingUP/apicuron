import { IsString, Validate } from 'class-validator';
import { OrcidChecksum } from '../../submit-reports/validators/orcid-checksum';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';

export class WeeklyStatisticsFilter {
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

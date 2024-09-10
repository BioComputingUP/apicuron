import { IsString, Validate } from 'class-validator';
import { OrcidChecksum } from '../../submit-reports/validators/orcid-checksum';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { PrivacyType } from '../../core/enums';
import { Expose, Type } from 'class-transformer';

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

export class ActivitiesStatistics {
	@Expose()
	activity_category: string;

	@Expose()
	activity_name: string;

	@Expose()
	activity_term: string;

	@Expose()
	count: number;

	@Expose()
	description: string;

	@Expose()
	score: number;

	@Expose()
	total_score: number;

	@Expose()
	last_contribution: Date;

	@Expose()
	first_contribution: Date;
}

export class DetailedStatisticsDto {
	@Expose()
	curator_orcid: string;

	@Expose()
	resource_id: string;

	@Expose()
	privacy: PrivacyType;

	@Expose()
	league: string;

	@Expose()
	total_count: number;

	@Expose()
	total_score: number;

	@Expose()
	last_contribution: Date;

	@Expose()
	first_contribution: Date;

	@Expose()
	@Type(() => ActivitiesStatistics)
	activities: ActivitiesStatistics[];

	@Expose()
	daysOfWeek: number[];

	@Expose()
	months: number[];

	@Expose()
	createdAt: Date;

	@Expose()
	updatedAt: Date;
}

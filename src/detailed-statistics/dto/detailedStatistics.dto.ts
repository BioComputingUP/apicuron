import { PrivacyType } from '../../core/enums';
import { Expose, Type } from 'class-transformer';

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

	@Expose()
	last_week_count: number;

	@Expose()
	last_month_count: number;

	@Expose()
	last_quarter_count: number;
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

	@Expose()
	last_week_count: number;

	@Expose()
	last_month_count: number;

	@Expose()
	last_quarter_count: number;
}

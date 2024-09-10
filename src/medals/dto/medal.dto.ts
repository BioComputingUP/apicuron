import { AchievementState, PrivacyType } from '../../core/enums';
import { Expose } from 'class-transformer';

export class MedalDto {
	@Expose()
	curator_orcid: string;

	@Expose()
	privacy: PrivacyType;

	@Expose()
	name: string;

	@Expose()
	resource_id: string;

	@Expose()
	list_terms: string[];

	@Expose()
	color: string;

	@Expose()
	score_relative: number;

	@Expose()
	first_day?: Date;

	@Expose()
	last_day?: Date;

	@Expose()
	league: string;

	@Expose()
	score_total: number;

	@Expose()
	score_threshold_valid: boolean;

	@Expose()
	score_relative_index: number;

	@Expose()
	score_relative_valid: boolean;

	@Expose()
	count_total: number;

	@Expose()
	state: AchievementState;
}

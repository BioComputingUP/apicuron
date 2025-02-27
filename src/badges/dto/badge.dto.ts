import { Expose } from 'class-transformer';
import { AchievementState, PrivacyType } from 'src/core/enums';
import { BadgeDef } from '../../core/schemas';

export class BadgeDefDto {
	@Expose()
	name: string;

	@Expose()
	displayedName: string;

	@Expose()
	resource_uri?: string;

	// fields from Badge
	@Expose()
	resource_id: string;

	@Expose()
	count: number;

	@Expose()
	color_code: string;

	@Expose()
	count_threshold: number;

	@Expose()
	list_terms: string[];

	@Expose()
	privacy: PrivacyType;

	@Expose()
	startDate?: Date;

	@Expose()
	endDate?: Date;
}

export class BadgeDto extends BadgeDefDto {
	@Expose()
	curator_orcid: string;

	@Expose()
	state: AchievementState;

	@Expose()
	achieved_at?: Date;

	@Expose()
	league: string;

	@Expose()
	privacy: PrivacyType;

	@Expose()
	startDate?: Date;

	@Expose()
	endDate?: Date;
}

export class PrivateBadgeDto extends BadgeDto {
	@Expose()
	progress_rate: number;
}

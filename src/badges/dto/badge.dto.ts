import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AchievementState, PrivacyType } from 'src/core/enums';

export class BadgeDto {
	@Expose()
	curator_orcid: string;

	@Expose()
	name: string;

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
	state: AchievementState;

	@Expose()
	achieved_at?: Date;

	@Expose()
	league: string;

	@Expose()
	privacy: PrivacyType;
}

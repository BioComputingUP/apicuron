import { ApiProperty } from '@nestjs/swagger';
import { AchievementState, PrivacyType } from '../../core/enums';

export class MedalDto {
	@ApiProperty()
	curator_orcid: string;

	@ApiProperty({
		enum: PrivacyType,
	})
	privacy: PrivacyType;

	@ApiProperty()
	name: string;

	@ApiProperty()
	resource_id: string;

	@ApiProperty()
	list_terms: string[];

	@ApiProperty()
	color: string;

	@ApiProperty()
	score_relative: number;

	@ApiProperty()
	first_day?: Date;

	@ApiProperty()
	last_day?: Date;

	@ApiProperty()
	league: string;

	@ApiProperty()
	score_total: number;

	@ApiProperty()
	score_threshold_valid: boolean;

	@ApiProperty()
	score_relative_index: number;

	@ApiProperty()
	score_relative_valid: boolean;

	@ApiProperty()
	count_total: number;

	@ApiProperty()
	state: AchievementState;
}

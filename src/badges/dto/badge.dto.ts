import { ApiProperty } from '@nestjs/swagger';
import { AchievementState, PrivacyType } from 'src/core/enums';

export class BadgeDto {
	@ApiProperty()
	curator_orcid: string;

	@ApiProperty()
	name: string;

	@ApiProperty()
	resource_uri?: string;

	// fields from Badge
	@ApiProperty()
	resource_id: string;

	@ApiProperty()
	count: number;

	@ApiProperty()
	color_code: string;

	@ApiProperty()
	count_threshold: number;

	@ApiProperty()
	list_terms: string[];

	@ApiProperty({
		enum: AchievementState,
	})
	state: AchievementState;

	@ApiProperty()
	achieved_at?: Date;

	@ApiProperty()
	league: string;

	@ApiProperty({
		enum: PrivacyType,
	})
	privacy: PrivacyType;
}

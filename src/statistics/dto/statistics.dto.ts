import { PrivacyType } from '../../core/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Paginated } from '../../pagination/paginator';
import { UserEntity } from '../../auth/users/dto/user';

export class StatisticsDto {
	@ApiProperty()
	badges_count: number;

	@ApiProperty()
	curator_orcid: string;

	@ApiProperty()
	generation_count: number;

	@ApiProperty()
	generation_score: number;

	@ApiProperty()
	invalidation_count: number;

	@ApiProperty()
	invalidation_score: number;

	@ApiProperty()
	medals_count: number;

	@ApiProperty()
	resource_uri?: string;

	@ApiProperty()
	revision_count: number;

	@ApiProperty()
	revision_score: number;

	@ApiProperty()
	total_count: number;

	@ApiProperty()
	total_score: number;

	@ApiProperty()
	resource_id: string;

	@ApiProperty()
	privacy: PrivacyType;

	@ApiProperty()
	league: string;

	@ApiProperty()
	last_contribution: Date;

	@ApiProperty()
	first_contribution: Date;
}

export class StatLeaderboardDto {
	@ApiProperty({ type: StatisticsDto })
	stat: StatisticsDto;

	@ApiProperty({ type: UserEntity })
	user: UserEntity;
}

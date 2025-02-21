import { PrivacyType } from '../../core/enums';
import { ApiProperty } from '@nestjs/swagger';
import { Paginated } from '../../pagination/paginator';
import { UserEntity } from '../../auth/users/dto/user.entity';
import { Expose, Type } from 'class-transformer';

export class StatisticsDto {
	@ApiProperty()
	@Expose()
	badges_count: number;

	@ApiProperty()
	@Expose()
	curator_orcid: string;

	@ApiProperty()
	@Expose()
	generation_count: number;

	@ApiProperty()
	@Expose()
	generation_score: number;

	@ApiProperty()
	@Expose()
	invalidation_count: number;

	@ApiProperty()
	@Expose()
	invalidation_score: number;

	@ApiProperty()
	@Expose()
	medals_count: number;

	@ApiProperty()
	@Expose()
	resource_uri?: string;

	@ApiProperty()
	@Expose()
	revision_count: number;

	@ApiProperty()
	@Expose()
	revision_score: number;

	@ApiProperty()
	@Expose()
	total_count: number;

	@ApiProperty()
	@Expose()
	total_score: number;

	@ApiProperty()
	@Expose()
	resource_id: string;

	@ApiProperty()
	@Expose()
	privacy: PrivacyType;

	@ApiProperty()
	@Expose()
	league: string;

	@ApiProperty()
	@Expose()
	last_contribution: Date;

	@ApiProperty()
	@Expose()
	first_contribution: Date;
}

export class StatLeaderboardDto {
	@Expose()
	@Type(() => StatisticsDto)
	stat: StatisticsDto;

	@Expose()
	@Type(() => UserEntity)
	user: UserEntity;
}

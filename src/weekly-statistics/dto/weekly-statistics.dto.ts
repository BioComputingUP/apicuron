import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { PrivacyType } from '../../core/enums';
import { UserEntity } from '../../auth/users/dto/user';
import { Expose, Type } from 'class-transformer';

export class WeeklyStatisticsDto {
	@IsString()
	@IsNotEmpty()
	@Expose()
	resource_id: string;

	@IsString()
	@IsNotEmpty()
	@Expose()
	privacy: PrivacyType;

	@IsString()
	@IsNotEmpty()
	@Expose()
	league: string;

	@IsString()
	@IsNotEmpty()
	@Expose()
	curator_orcid: string;

	@IsString()
	@IsNotEmpty()
	@Expose()
	generation_count: number;

	@IsString()
	@IsNotEmpty()
	@Expose()
	generation_score: number;

	@IsString()
	@IsNotEmpty()
	@Expose()
	invalidation_count: number;

	@IsString()
	@IsNotEmpty()
	@Expose()
	invalidation_score: number;

	@IsString()
	@IsNotEmpty()
	@Expose()
	resource_uri?: string;

	@IsString()
	@IsNotEmpty()
	@Expose()
	revision_count: number;

	@IsString()
	@IsNotEmpty()
	@Expose()
	revision_score: number;

	@IsString()
	@IsNotEmpty()
	@Expose()
	total_count: number;

	@IsString()
	@IsNotEmpty()
	@Expose()
	total_score: number;

	@IsDate()
	@IsNotEmpty()
	@Expose()
	last_contribution: Date;

	@IsDate()
	@IsNotEmpty()
	@Expose()
	first_contribution: Date;

	@IsString()
	@IsNotEmpty()
	@Expose()
	daysOfWeek: number[];

	@IsDate()
	@IsNotEmpty()
	@Expose()
	createdAt: Date;
	@IsDate()
	@IsNotEmpty()
	@Expose()
	updatedAt: Date;
}

export class WeeklyLeaderboardDto {
	@Type(() => WeeklyStatisticsDto)
	@Expose()
	stat: WeeklyStatisticsDto;

	@Type(() => UserEntity)
	@Expose()
	user: UserEntity;
}

import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { PrivacyType } from '../../core/enums';
import { Paginated } from '../../pagination/paginator';
import { ApiProperty } from '@nestjs/swagger';

export class WeeklyStatisticsDto {
	@IsString()
	@IsNotEmpty()
	resource_id: string;

	@IsString()
	@IsNotEmpty()
	privacy: PrivacyType;

	@IsString()
	@IsNotEmpty()
	league: string;

	@IsString()
	@IsNotEmpty()
	curator_orcid: string;

	@IsString()
	@IsNotEmpty()
	generation_count: number;

	@IsString()
	@IsNotEmpty()
	generation_score: number;

	@IsString()
	@IsNotEmpty()
	invalidation_count: number;

	@IsString()
	@IsNotEmpty()
	invalidation_score: number;

	@IsString()
	@IsNotEmpty()
	resource_uri?: string;

	@IsString()
	@IsNotEmpty()
	revision_count: number;

	@IsString()
	@IsNotEmpty()
	revision_score: number;

	@IsString()
	@IsNotEmpty()
	total_count: number;

	@IsString()
	@IsNotEmpty()
	total_score: number;

	@IsDate()
	@IsNotEmpty()
	last_contribution: Date;

	@IsDate()
	@IsNotEmpty()
	first_contribution: Date;

	@IsString()
	@IsNotEmpty()
	daysOfWeek: number[];

	@IsDate()
	@IsNotEmpty()
	createdAt: Date;
	@IsDate()
	@IsNotEmpty()
	updatedAt: Date;
}

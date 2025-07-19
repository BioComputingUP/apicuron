import { AchievementState, PrivacyType } from '../../core/enums';
import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { StorageReference } from 'src/shared/decorators/storage-reference.decorator';

export class MedalDefDto {
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
}

export class MedalUser {
	@Expose()
	displayedName: string;

	@Expose()
	orcid_id: string;

	@Expose()
	@StorageReference()
	avatar: string;
}

export class MedalDto extends MedalDefDto {
	@Expose()
	curator_orcid: string;

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

	@Expose()
	@Type(() => MedalUser)
	user: MedalUser;
}

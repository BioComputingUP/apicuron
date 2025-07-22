import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { pick } from 'lodash';
import { BasePaginationDto } from '../../pagination/dto/paginate.dto';
import { AchievementState } from '../../core/enums';

export class BadgeFilter extends BasePaginationDto {
	@IsOptional()
	@IsString()
	curator_orcid?: string;

	@IsOptional()
	@IsString()
	resource_id?: string;

	@IsOptional()
	@IsString()
	displayedName?: string;

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	@Min(1)
	count_threshold?: number;

	@IsOptional()
	@IsString()
	@IsIn(['count_threshold', 'name'])
	sortBy?: string;

	@IsOptional()
	@IsString()
	@IsIn(['1', '-1', 'asc', 'desc'])
	sortOrder?: '1' | '-1' | 'asc' | 'desc';

	getQuery() {
		return pick(this, [
			'curator_orcid',
			'resource_id',
			'name',
			'count_threshold',
		]);
	}

	defaultLimit: 10;
}

export class UserBadgesFilter extends BasePaginationDto {
	@IsOptional()
	@IsString()
	resource_id?: string;

	@IsOptional()
	@IsString()
	displayedName?: string;

	@IsIn(Object.values(AchievementState), { always: false })
	@IsString()
	@IsOptional()
	state?: AchievementState;

	@Transform(({ value }) => parseInt(value))
	@IsOptional()
	@IsInt()
	@Min(1)
	count_threshold?: number;

	@IsOptional()
	@IsString()
	@IsIn([
		'count_threshold',
		'name',
		'displayedName',
		'achieved_at',
		'progress_rate',
	])
	sortBy?: string;

	@IsOptional()
	@IsString()
	@IsIn(['1', '-1', 'asc', 'desc'])
	sortOrder?: '1' | '-1' | 'asc' | 'desc';

	getQuery() {
		return pick(this, [
			'resource_id',
			'displayedName',
			'state',
			'count_threshold',
		]);
	}
}

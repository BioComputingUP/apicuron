import {
	IsNotEmpty,
	IsOptional,
	Matches,
	Min,
	Validate,
} from 'class-validator';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { BadgeUnique } from '../validators/achievement-exists';

export class BadgeFilter extends PaginateDto {
	static create(obj: any) {
		const filter = new BadgeFilter();
		Object.assign(filter, obj);
		return filter;
	}

	@Validate(ResourceIdExists)
	@IsOptional()
	resource_id?: string;

	@Validate(BadgeUnique, [{ reverse: true }])
	@IsOptional()
	name?: string;
}

export class DeleteBadgeDto {
	@IsNotEmpty()
	@Validate(ResourceIdExists)
	resource_id: string;

	@IsNotEmpty()
	@Validate(BadgeUnique, [{ reverse: true }])
	name: string;
}

export class CreateBadgeDto {
	@IsOptional()
	category: string;

	// matches that the color is either a hex code or bronze, gold or silver
	@Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
		message:
			'a badge color has to be either a color hexcode, "bronze", "gold" or "silver"',
	})
	@IsNotEmpty()
	color_code: string;

	@Min(1)
	@IsNotEmpty()
	count_threshold: number;

	@Validate(BadgeUnique)
	@IsNotEmpty()
	name: string;

	@Validate(ResourceIdExists)
	@IsNotEmpty()
	resource_id: string;

	@Validate(ActivityTermExists, [{ each: true }])
	@IsNotEmpty()
	list_terms: string[];
}

export class UpdateBadgeDto {
	@IsOptional()
	category: string;

	// matches that the color is either a hex code or bronze, gold or silver
	@Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|bronze|gold|silver/, {
		message:
			'a badge color has to be either a color hexcode, "bronze", "gold" or "silver"',
	})
	@IsOptional()
	color_code: string;

	@Min(1)
	@IsOptional()
	count_threshold: number;

	@Validate(BadgeUnique, [{ reverse: true }])
	@IsOptional()
	name: string;

	@Validate(ResourceIdExists)
	@IsOptional()
	resource_id: string;

	@Validate(ActivityTermExists, [{ each: true }])
	@IsOptional()
	list_terms: string[];
}

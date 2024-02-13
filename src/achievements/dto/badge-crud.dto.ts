import {
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
	Min,
	Validate,
} from 'class-validator';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { BadgeUnique } from '../validators/achievement-exists';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { AchievementDef } from '../../core/schemas/achievements-def/achievement-def.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { FilterQuery } from 'mongoose';
import { AchievementType } from '../../core/enums';

export class BadgeDefFilter extends PaginateDto {
	static create(obj: any) {
		const filter = new BadgeDefFilter();
		Object.assign(filter, obj);
		return filter;
	}

	@Validate(ResourceIdExists)
	@IsOptional()
	resource_id?: string;

	@Validate(EntryExistsRule, [
		AchievementDef.name,
		({ name }) => {
			return { name, type: AchievementType.badge };
		},
	])
	@IsOptional()
	name?: string;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }): FilterQuery<PartnerResourceDocument> => {
			return {
				leagues: league,
				resource_id,
			};
		},
	])
	@IsString()
	@IsOptional()
	league: string;
}

export class DeleteBadgeDefDto {
	@IsNotEmpty()
	@Validate(ResourceIdExists)
	resource_id: string;

	@IsNotEmpty()
	@Validate(EntryExistsRule, [
		AchievementDef.name,
		({ name }) => {
			return { name, type: AchievementType.badge };
		},
	])
	name: string;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }): FilterQuery<PartnerResourceDocument> => {
			return {
				leagues: league,
				resource_id,
			};
		},
	])
	@IsString()
	@IsOptional()
	league: string;
}

export class CreateBadgeDefDto {
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

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }): FilterQuery<PartnerResourceDocument> => {
			return {
				leagues: league,
				resource_id,
			};
		},
	])
	@IsString()
	@IsOptional()
	league: string;
}

export class UpdateBadgeDefDto {
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

	@Validate(EntryExistsRule, [
		AchievementDef.name,
		({ name, resource_id }) => {
			return { name, resource_id, type: AchievementType.badge };
		},
	])
	@IsOptional()
	name: string;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return { resource_id };
		},
	])
	@IsOptional()
	resource_id: string;

	@Validate(ActivityTermExists, [{ each: true }])
	@IsOptional()
	list_terms: string[];

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }): FilterQuery<PartnerResourceDocument> => {
			return {
				leagues: league,
				resource_id,
			};
		},
	])
	@IsString()
	@IsOptional()
	league: string;
}

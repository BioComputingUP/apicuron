import { Validate, IsOptional, IsString } from 'class-validator';
import { FilterQuery } from 'mongoose';
import { AchievementType } from '../../core/enums';
import { AchievementDef } from '../../core/schemas/achievements-def/achievement-def.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { BasePaginationDto } from '../../pagination/dto/paginate.dto';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';

export class BadgeDefFilter extends BasePaginationDto {
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

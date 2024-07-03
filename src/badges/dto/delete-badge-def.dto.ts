import { IsNotEmpty, Validate, IsString, IsOptional } from 'class-validator';
import { FilterQuery } from 'mongoose';
import { AchievementType } from '../../core/enums';
import { AchievementDef } from '../../core/schemas/achievements-def/achievement-def.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../../core/schemas/achievements-def/badge-def.schema';

export class DeleteBadgeDefDto {
	@IsNotEmpty()
	@Validate(ResourceIdExists)
	resource_id: string;

	@Validate(EntryExistsRule, [
		BadgeDef.name,
		({ name, league, resource_id }): FilterQuery<BadgeDefDocument> => {
			const q: FilterQuery<BadgeDefDocument> = {
				name,
				resource_id,
			};
			if (!!league) {
				q.league = league;
			}
			return q;
		},
	])
	@IsNotEmpty()
	name: string;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }): FilterQuery<PartnerResourceDocument> => {
			return {
				'leagues.name': league,
				resource_id,
			};
		},
	])
	@IsString()
	@IsOptional()
	league?: string;
}

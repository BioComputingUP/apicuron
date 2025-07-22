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
import { MedalDef } from '../../core/schemas/achievements-def/medal-def.schema';

export class DeleteMedalDefDto {
	@IsNotEmpty()
	@Validate(ResourceIdExists)
	resource_id: string;

	@IsNotEmpty()
	@Validate(EntryExistsRule, [
		MedalDef.name,
		({ name, resource_id }) => {
			return { name, resource_id };
		},
	])
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
	league: string;
}

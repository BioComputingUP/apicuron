import { IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { ActivityTermExists } from '../validators/activity-term-exists';
import { FilterQuery } from 'mongoose';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';

export class DeleteTermDto {
	@Validate(ResourceIdExists)
	@IsNotEmpty()
	resource_id: string;

	@Validate(ActivityTermExists)
	@IsNotEmpty()
	activity_term: string;

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

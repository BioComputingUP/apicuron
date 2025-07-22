import { IsString, IsNotEmpty, Validate } from 'class-validator';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../../../core/schemas/resource/partner-resource.schema';
import { FilterQuery } from 'mongoose';
import { EntryExistsRule } from '../../../../shared/validators/entry-exists.validator';

export class DeleteLeagueDTO {
	@IsString()
	@IsNotEmpty()
	resource_id: string;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ league, resource_id }): FilterQuery<PartnerResourceDocument> => {
			return {
				resource_id,
				leagues: {
					$elemMatch: { name: league },
				},
			};
		},
	])
	@IsString()
	@IsNotEmpty()
	league: string;
}

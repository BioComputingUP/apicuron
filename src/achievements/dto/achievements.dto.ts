import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { OrcidExists } from '../../auth/validators/orcidExists.dto';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { Expose } from 'class-transformer';

export class AchievementSelectDto {
	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return { resource_id };
		},
	])
	@IsString()
	@IsNotEmpty()
	@Expose()
	resource_id: string;

	@Validate(OrcidExists)
	@IsString()
	@IsNotEmpty()
	@Expose()
	orcid_id: string;
}

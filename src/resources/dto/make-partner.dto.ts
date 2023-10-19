import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { SubmittedResource } from '../../core/schemas/resource.schema';

export class MakePartner {
	@Validate(EntryExistsRule, [
		SubmittedResource.name,
		({ resource_id }) => {
			return {
				resource_id,
			};
		},
	])
	@IsString()
	@IsNotEmpty()
	resource_id: string;
}

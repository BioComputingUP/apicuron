import { IsNotEmpty, Validate } from 'class-validator';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { ActivityTermExists } from '../validators/activity-term-exists';

export class DeleteTermDto {
	@Validate(ResourceIdExists)
	@IsNotEmpty()
	resource_id: string;

	@Validate(ActivityTermExists)
	@IsNotEmpty()
	activity_term: string;
}

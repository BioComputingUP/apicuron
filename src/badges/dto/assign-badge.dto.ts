import { Expose, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, Validate } from 'class-validator';
import { ResourceIdExists } from 'src/resources/partner-resources/validators/resource-id-exists';

export class AssignBadgeDto {
	@Validate(ResourceIdExists)
	@IsNotEmpty()
	@Expose()
	resource_id: string;

	@IsNotEmpty({ each: true })
	@IsArray()
	@Type(() => String)
	user_orcids: string[];

	@IsNotEmpty()
	@IsString()
	badge_name: string;
}

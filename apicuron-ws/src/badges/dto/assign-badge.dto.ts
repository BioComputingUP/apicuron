import { Expose, Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, Validate } from 'class-validator';
import { FilterQuery } from 'mongoose';
import { OrcidExists } from 'src/auth/validators/orcidExists.dto';
import { BadgeDef, BadgeDefDocument } from 'src/core/schemas';
import { ResourceIdExists } from 'src/resources/partner-resources/validators/resource-id-exists';
import { EntryExistsRule } from 'src/shared/validators/entry-exists.validator';

export class AssignBadgeDto {
	@Validate(ResourceIdExists)
	@IsNotEmpty()
	@Expose()
	resource_id: string;

	@IsNotEmpty({ each: true })
	@Validate(OrcidExists, [{ each: true }])
	@IsArray()
	@Type(() => String)
	user_orcids: string[];

	@Validate(EntryExistsRule, [
		BadgeDef.name,
		({ badge_name, resource_id, league }) => {
			const q: FilterQuery<BadgeDefDocument> = { badge_name, resource_id };
			if (league) {
				q.league = league;
			}
			return q;
		},
	])
	@IsString()
	badge_name: string;
}

import { IsNotEmpty, IsOptional, Matches, Min, Validate } from "class-validator";
import { ResourceIdExists } from "../../resources/partner-resources/validators/resource-id-exists";
import { ActivityTermExists } from "../../terms/validators/activity-term-exists";
import { BadgeUnique } from "../validators/achievement-exists";


export class BadgeFilter {

    @IsOptional()
    @Validate(ResourceIdExists)
    resource_id?: string

    @IsOptional()
    @Validate(BadgeUnique, [{ reverse: true }])
    name: string
}

export class DeleteBadgeDto {

    @IsNotEmpty()
    @Validate(ResourceIdExists)
    resource_id: string;

    @IsNotEmpty()
    @Validate(BadgeUnique, [{ reverse: true }])
    name: string
}

export class CreateBadgeDto {
	@IsNotEmpty()
	category: string;

	@IsNotEmpty()
    // matches that the color is either a hex code or bronze, gold or silver
    @Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
        message: 'a badge color has to be either a color hexcode, "bronze", "gold" or "silver"'
    })
	color_code: string;

	@IsNotEmpty()
    @Min(1)
	count_threshold: number;

	@IsNotEmpty()
    @Validate(BadgeUnique)
	name: string;

	@IsNotEmpty()
	@Validate(ResourceIdExists)
	resource_id: string;

	@IsNotEmpty()
	@Validate(ActivityTermExists, [{ each: true }])
	list_terms: string[];
}


export class UpdateBadgeDto {
    @IsOptional()
	category: string;

	@IsOptional()
    // matches that the color is either a hex code or bronze, gold or silver
    @Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|bronze|gold|silver/, {
        message: 'a badge color has to be either a color hexcode, "bronze", "gold" or "silver"'
    })
	color_code: string;

	@IsOptional()
    @Min(1)
	count_threshold: number;

	@IsOptional()
    @Validate(BadgeUnique,[ { reverse: true }])
	name: string;

	@IsOptional()
	@Validate(ResourceIdExists)
	resource_id: string;

	@IsOptional()
	@Validate(ActivityTermExists, [{ each: true }])
	list_terms: string[];
}
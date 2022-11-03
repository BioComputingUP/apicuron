import { IsDate, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxDate, Min, MinDate, Validate } from "class-validator";
import { ResourceIdExists } from "../../resources/partner-resources/validators/resource-id-exists";
import { ActivityTermExists } from "../../terms/validators/activity-term-exists";
import { MedalUnique } from "../validators/achievement-exists";
import { MaxDateField, MinDateField } from "../validators/date-comparison";


export class CreateMedalDto {

    @IsNotEmpty()
    @IsString()
	category: string;

    @IsNotEmpty()
    @IsString()
    @Validate(MedalUnique)
	name: string;

    // @IsOptional()
	// resource_uri: string;

    @IsNotEmpty()
    @IsString()
    @Validate(ResourceIdExists)
	resource_id: string;

    @IsNotEmpty()
    @Validate(ActivityTermExists, [{ each: true }])
	list_terms: string[];
    

    @IsNotEmpty()
    @Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
        message: 'a medal color has to be either a color hexcode, "bronze", "gold" or "silver"'
    })
	color: string;


    @IsNotEmpty()
    @IsNumber()
    @Min(1)
	score_relative: number;

    @IsOptional()
    @IsDateString()
    @MaxDateField(['last_day'])
    first_day: Date;

    @IsOptional()
    @IsDateString()
	@MinDateField(['first_day'])
    last_day: Date;

}

export class MedalsFilter {
    @IsOptional()
    @IsDateString()
    @MaxDateField(['last_day'])
    first_day: Date;

    @IsOptional()
    @IsDateString()
	@MinDateField(['first_day'])
    last_day: Date;

    @IsOptional()
    @IsString()
    @Validate(MedalUnique)
	name: string;

    @IsOptional()
    @IsString()
    @Validate(ResourceIdExists)
	resource_id: string;
}

export class DeleteMedalDto {
    @IsNotEmpty()
    @IsString()
    @Validate(MedalUnique, [{ reverse: true }])
	name: string;

    @IsNotEmpty()
    @IsString()
    @Validate(ResourceIdExists)
	resource_id: string;
}

export class UpdateMedalDto extends DeleteMedalDto {


    @IsOptional()
    @IsString()
	category: string;

    @IsOptional()
    @Validate(ActivityTermExists, [{ each: true }])
	list_terms: string[];

    @IsOptional()
    @Matches(/(^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$)|^bronze$|^gold$|^silver$/, {
        message: 'a medal color has to be either a color hexcode, "bronze", "gold" or "silver"'
    })
	color: string;


    @IsOptional()
    @IsNumber()
    @Min(1)
	score_relative: number;

    @IsOptional()
    @IsDateString()
    @MaxDateField(['last_day'])
    first_day: Date;

    @IsOptional()
    @IsDateString()
	@MinDateField(['first_day'])
    last_day: Date;
}




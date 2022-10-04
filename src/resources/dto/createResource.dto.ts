import { IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, MinLength, Validate } from "class-validator";
import { UniqueResourceIdRule } from "../submitted-resources/validators/unique-resource-id"
import { UniqueResourceURIRule } from "../submitted-resources/validators/unique-resource-uri"


export class createResourceDto {
    
    @IsString()
    @IsNotEmpty()
	resource_description: string;

    @IsString()
    @IsNotEmpty()
    @Validate(UniqueResourceIdRule)
	resource_id: string;

    @IsString()
    @MaxLength(60)
    @IsNotEmpty()
	resource_long_name: string;


    @IsString()
    @MaxLength(20)
    @IsNotEmpty()
	resource_name: string;

    @IsString()
    @IsUrl()
    @IsNotEmpty()
    @Validate(UniqueResourceURIRule)
	resource_uri: string;
    
    @IsString()
    @IsUrl()
    @IsNotEmpty()
	resource_url: string;
}
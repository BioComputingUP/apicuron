import { IsEmpty, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, MinLength, Validate } from "class-validator";
import { UniqueRule } from "../../shared/validators/unique.validator";
import { Resource } from "../schemas/resource.schema";
import { SubmittedResource } from "../schemas/submitted-resource.schema";
import { UniqueResourceIdRule } from "../submitted-resources/validators/unique-resource-id"
import { UniqueResourceURIRule } from "../submitted-resources/validators/unique-resource-uri"


export class CreateResourceDto {
    
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
    @Validate(UniqueRule, [
        Resource.name,
        (resource_long_name) => {
            return {
                resource_long_name
            }
        } 
    ])
	resource_long_name: string;


    @IsString()
    @MaxLength(20)
    @IsNotEmpty()
    @Validate(UniqueRule, [
        Resource.name,
        (resource_name) => {
            return {
                resource_name
            }
        }
    ])
	resource_name: string;

    @IsString()
    @IsUrl()
    @IsNotEmpty()
    @Validate(UniqueResourceURIRule)
	resource_uri: string;
    
    @IsString()
    @IsUrl()
    @IsNotEmpty()
    @Validate(UniqueRule, [
        Resource.name,
        (resource_url) => {
            return {
                resource_url
            }
        } 
    ])
	resource_url: string;

    @IsString()
    @IsNotEmpty()
    @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: 'The resource color has to be a color hexcode'
    })
    color: string;

    @IsEmpty()
    logo: string;
}

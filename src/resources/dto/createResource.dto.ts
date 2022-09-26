import { IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, MinLength } from "class-validator";


export class createResourceDto {
    
    @IsString()
    @IsNotEmpty()
	resource_description: string;

    @IsString()
    @IsNotEmpty()
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
	resource_uri: string;
    
    @IsString()
    @IsUrl()
    @IsNotEmpty()
	resource_url: string;
}
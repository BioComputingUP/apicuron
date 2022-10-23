import { IsNotEmpty, IsOptional, IsString, IsUrl, Max, MaxLength, MinLength, Validate } from "class-validator";


export class UpdatePartnerResourceDto {

    @IsString()
    @IsNotEmpty()
	resource_id: string;

    // @IsString()
    // @IsUrl()
    // @IsNotEmpty()
	// resource_uri: string;
    
    @IsOptional()
    @IsString()
	resource_description: string;  

    @IsOptional()
    @IsString()
    @MaxLength(60)
	resource_long_name: string;


    @IsOptional()
    @IsString()
    @MaxLength(20)
	resource_name: string;
    
    @IsOptional()
    @IsString()
    @IsUrl()
	resource_url: string;
}
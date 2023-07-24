import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty, IsNotEmpty, IsOptional, IsString, IsUrl, Matches, Max, MaxLength, MinLength, Validate } from "class-validator";


export class UpdatePartnerResourceDto {

    @IsString()
    @IsNotEmpty()
	resource_id: string;

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

    @IsEmpty()
    @ApiProperty({ type: 'file', format: 'jpeg/png/svg' })
    logo: string


    @IsString()
    @IsOptional()
    @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
        message: 'The resource color has to be a color hexcode'
    })
    color: string
}
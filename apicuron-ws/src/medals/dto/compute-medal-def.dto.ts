import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, Max, ValidateNested } from 'class-validator';
import { CreateMedalDefDto } from './create-medal-def.dto';

/**
 * DTO for previewing medals with pagination options.
 * Extends {@link CreateMedalDefDto} and adds optional `skip` and `limit` properties.
 *
 * @property skip - The number of medals to skip in the result set. Defaults to 0.
 * @property limit - The maximum number of medals to return. Defaults to 10. Maximum allowed is 20.
 */
export class PreviewMedalsDto {
	@Type(() => CreateMedalDefDto)
    @ValidateNested()
    @IsNotEmpty()
	medalDef: CreateMedalDefDto;

	@IsInt()
	@IsOptional()
	skip: number = 0;

	@IsInt()
	@Max(20)
	@IsOptional()
	limit: number = 10;
}

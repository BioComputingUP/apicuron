import {
	ArrayNotEmpty,
	IsBoolean,
	IsNotEmpty,
	IsString,
	IsUrl,
} from 'class-validator';

export class MigrateResourceDto {
	@IsString()
	@IsNotEmpty()
	resource_id: string;

	@ArrayNotEmpty()
	@IsString({ each: true })
	@IsNotEmpty({ each: true })
	admin_orcids: string[];

	@IsUrl()
	@IsString()
	@IsNotEmpty()
	base_url: string;

	@IsBoolean()
	overwrite?: boolean; // set this to true to overwrite (delete an old resource and create a new one)
}

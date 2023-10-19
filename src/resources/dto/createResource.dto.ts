import {
	IsEmpty,
	IsNotEmpty,
	IsString,
	IsUrl,
	Matches,
	MaxLength,
	Validate,
} from 'class-validator';
import { UniqueRule } from '../../shared/validators/unique.validator';
import { Resource } from '../../core/schemas/resource.schema';
import { UniqueResourceIdRule } from '../validators/unique-resource-id';
import { UniqueResourceURIRule } from '../validators/unique-resource-uri';

export class CreateResourceDto {
	@IsString()
	@IsNotEmpty()
	resource_description: string;

	@Validate(UniqueResourceIdRule)
	@IsString()
	@IsNotEmpty()
	resource_id: string;

	@Validate(UniqueRule, [
		Resource.name,
		({ resource_long_name }) => {
			return {
				resource_long_name,
			};
		},
	])
	@MaxLength(60)
	@IsString()
	@IsNotEmpty()
	resource_long_name: string;

	@Validate(UniqueRule, [
		Resource.name,
		({ resource_name }) => {
			return {
				resource_name,
			};
		},
	])
	@MaxLength(25)
	@IsString()
	@IsNotEmpty()
	resource_name: string;

	@Validate(UniqueResourceURIRule)
	@IsUrl()
	@IsString()
	@IsNotEmpty()
	resource_uri: string;

	@Validate(UniqueRule, [
		Resource.name,
		({ resource_url }) => {
			return {
				resource_url,
			};
		},
	])
	@IsUrl()
	@IsString()
	@IsNotEmpty()
	resource_url: string;

	@Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
		message: 'The resource color has to be a color hexcode',
	})
	@IsString()
	@IsNotEmpty()
	color: string;

	@IsEmpty()
	logo: string;
}

import {
	IsEmpty,
	IsHexColor,
	IsNotEmpty,
	IsString,
	IsUrl,
	Matches,
	MaxLength,
	Validate,
} from 'class-validator';
import { UniqueRule } from '../../shared/validators/unique.validator';
import { Resource } from '../../core/schemas/resource/resource.schema';

export class CreateResourceDto {
	@IsString()
	@IsNotEmpty()
	resource_description: string;

	@Validate(UniqueRule, [
		Resource.name,
		({ resource_id }) => {
			return {
				resource_id,
			};
		},
	])
	@Matches(/^([a-z0-9-]|\-|\_)+$/)
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

	@Validate(UniqueRule, [
		Resource.name,
		({ resource_uri }) => {
			return {
				resource_uri,
			};
		},
	])
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

	@IsHexColor()
	@IsString()
	@IsNotEmpty()
	color: string;

	@IsEmpty()
	logo?: string;
}

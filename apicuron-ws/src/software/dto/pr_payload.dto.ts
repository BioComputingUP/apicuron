import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsArray,
	IsNotEmpty,
	IsNotEmptyObject,
	IsString,
	ValidateNested,
} from 'class-validator';
import { BasePayload as BasePayloadDto } from './base_payload';

class PRContext {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	pr_id: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	pr_url: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	target_branch: string;

	@ApiProperty()
	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty()
	labels: string[];

	@ApiProperty()
	@IsArray()
	@IsString({ each: true })
	@IsNotEmpty()
	reviewers: string[];

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	title: string;
}

export class PRPayloadDto extends BasePayloadDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	event_type: 'pull_request';

	@ApiProperty()
	@IsNotEmptyObject()
	@Type(() => PRContext)
	@ValidateNested()
	context: PRContext;
}

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	ArrayMinSize,
	Equals,
	IsArray,
	IsISO8601,
	IsNotEmpty,
	IsObject,
	IsString,
	ValidateNested,
} from 'class-validator';

export const MAX_BATCH_EVENTS = 500;

/** Validation only: the stored payload is taken from the raw request body. */
export class TrackerEventDto {
	@ApiProperty({ example: '1.0' })
	@Equals('1.0')
	specversion: '1.0';

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	id: string;

	@ApiProperty({ example: 'github:repository:123456' })
	@IsString()
	@IsNotEmpty()
	source: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	type: string;

	@ApiProperty({ example: 'pull_request/42' })
	@IsString()
	@IsNotEmpty()
	subject: string;

	@ApiProperty()
	@IsISO8601()
	time: string;

	@ApiProperty({ example: 'application/json' })
	@Equals('application/json')
	datacontenttype: 'application/json';

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	dataschema: string;

	@ApiProperty({ type: Object })
	@IsObject()
	data: Record<string, unknown>; // The raw event payload may change based on the event type
}

export class TrackerEventBatchDto {
	@ApiProperty({ type: [TrackerEventDto] })
	@IsArray()
	@ArrayMinSize(1)
	@ArrayMaxSize(MAX_BATCH_EVENTS)
	@ValidateNested({ each: true })
	@Type(() => TrackerEventDto)
	events: TrackerEventDto[];
}
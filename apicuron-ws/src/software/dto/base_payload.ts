import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class BasePayload {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	contribution_id: string;

	@ApiPropertyOptional()
	@IsString()
	@IsNotEmpty()
	github_login: string | null;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	repository: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	timestamp: string;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	resource_id: string;
}

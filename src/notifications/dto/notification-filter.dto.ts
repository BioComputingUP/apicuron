import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginateDto } from '../../pagination/dto/paginate.dto';
import { ApiProperty } from '@nestjs/swagger';

export class NotificationFilter extends PaginateDto {
	@ApiProperty({
		default: false,
		description:
			'This Property filters notifications By "seen" if true, notifications marked as seen.',
	})
	@IsBoolean()
	@IsOptional()
	@Transform(({ value }) =>
		typeof value === 'string' ? value.toLowerCase() === 'true' : value,
	)
	seen = false;
}

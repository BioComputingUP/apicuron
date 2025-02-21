import { ApiProperty } from '@nestjs/swagger';
import { BasePaginationDto } from './dto/paginate.dto';
import { Expose } from 'class-transformer';

class Pagination {
	@ApiProperty()
	start: number;

	@ApiProperty()
	limit: number;

	@ApiProperty()
	total: number;
}

class Meta {
	@ApiProperty()
	pagination: Pagination;
}
export class Paginated<T> {
	@ApiProperty({ isArray: true })
	@Expose()
	data: T[];

	@ApiProperty()
	@Expose()
	meta: Meta;

	constructor(data: T[] = [], page: BasePaginationDto, totalCount: number) {
		this.data = data;
		this.meta = {
			pagination: {
				start: page.skip + 1,
				limit: page.limit || -1,
				total: totalCount,
			},
		};
	}
}
export function paginate<T>(
	data: T[],
	page: BasePaginationDto,
	totalCount: number,
): Paginated<T> {
	return new Paginated<T>(data, page, totalCount);
}

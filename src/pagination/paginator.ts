import { ApiProperty } from '@nestjs/swagger';
import { PaginateDto } from './dto/paginate.dto';
// import { Paginated } from './interfaces/paginated';

export class Paginated<T> {
	@ApiProperty({ isArray: true })
	data: T[];

	@ApiProperty()
	meta: {
		pagination: {
			start: number;
			limit: number;
			total: number;
		};
	};

	constructor(data: T[], page: PaginateDto, totalCount: number) {
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
	page: PaginateDto,
	totalCount: number,
): Paginated<T> {
	return new Paginated<T>(data, page, totalCount);
}

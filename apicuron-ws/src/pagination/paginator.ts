import { ApiProperty } from '@nestjs/swagger';
import { BasePaginationDto } from './dto/paginate.dto';
import { Exclude, Expose, plainToClassFromExist, Type, TypeHelpOptions } from 'class-transformer';

class Pagination {
	@ApiProperty()
	@Expose()
	start: number;

	@ApiProperty()
	@Expose()
	limit: number;

	@ApiProperty()
	@Expose()
	total: number;
}

class Meta {
	@ApiProperty()
	@Expose()
	pagination: Pagination;
}


class DtoGeneric<T = unknown> {
	@Exclude()
	_type: new () => T;


	constructor(type: new () => T) {
		this._type = type;
	}
}
export class Paginated<T> extends DtoGeneric<T> {
	@ApiProperty({ isArray: true })
	@Type((options: TypeHelpOptions) => {
		return (options.newObject as Paginated<T>)._type;
	})
	@Expose()
	data: T[];

	@ApiProperty()
	@Expose()
	meta: Meta;

}
export function paginate<T>(
	Class: new () => T,
	data: any[],
	page: BasePaginationDto,
	totalCount: number,
): Paginated<T> {
	return plainToClassFromExist(new Paginated<T>(Class), {
		data, meta: {
			pagination: {
				start: page.skip + 1,
				limit: page.limit || -1,
				total: totalCount,
			}
		}
	}, {
		excludeExtraneousValues: true,
		enableCircularCheck: true
	})


}


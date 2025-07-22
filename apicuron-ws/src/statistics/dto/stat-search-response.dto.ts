import { Expose, Type } from 'class-transformer';
import { StatisticsDto } from './statistics.dto';
import { StorageReference } from 'src/shared/decorators';

export class StatSearchResponseDto {
	@Expose()
	orcid_id: string;

	@Expose()
	displayedName: string;

	@Expose()
	@StorageReference()
	avatar: string;

	@Expose()
	@Type(() => StatisticsDto)
	stats: StatisticsDto[];
}

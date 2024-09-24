import { Expose, Type } from 'class-transformer';
import { StatisticsDto } from './statistics.dto';

export class StatSearchResponseDto {
	@Expose()
	orcid_id: string;

	@Expose()
	displayedName: string;

	@Expose()
	avatar: string;

	@Expose()
	@Type(() => StatisticsDto)
	stats: StatisticsDto[];
}

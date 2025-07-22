import { Expose } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ResourceStatsDto {
	/**
	 * @remark Use fromDocument instead
	 */

	@IsNotEmpty()
	@IsString()
	@Expose()
	resource_id: string;

	@IsNotEmpty()
	@IsNumber()
	@Expose()
	contributionCount: number;

	@IsNotEmpty()
	@IsNumber()
	@Expose()
	uniqueContributors: number;

	@IsDate()
	@Expose()
	lastContributionDate?: Date | null; // <- optional

	@IsDate()
	@Expose()
	firstContributionDate?: Date | null;

	@IsDate()
	@Expose()
	lastResourceUpdateDate?: Date;
}

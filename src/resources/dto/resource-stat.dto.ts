import { Expose } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ResourceStatsDocument } from '../../core/schemas';

export class ResourceStatsDto {
	private constructor() {}

	static fromDocument(document: ResourceStatsDocument) {
		const entity = new ResourceStatsDto();
		entity.resource_id = document.resource_id;
		entity.contributionCount = document.contributionCount;
		entity.uniqueContributors = document.uniqueContributors;
		entity.lastContributionDate = document.lastContributionDate;
		entity.firstContributionDate = document.firstContributionDate;
		entity.lastResourceUpdateDate = document.lastResourceUpdateDate;

		return entity;
	}

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
	lastContributionDate: Date;

	@IsDate()
	@Expose()
	firstContributionDate: Date;

	@IsDate()
	@Expose()
	lastResourceUpdateDate: Date;
}

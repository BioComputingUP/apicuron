import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsArray,
	IsEnum,
	IsOptional,
	IsString,
	ValidateIf,
} from 'class-validator';
import * as _ from 'lodash';
import { FilterQuery } from 'mongoose';
import { PrivacyType } from 'src/core/enums';
import { CuratorRegistryEntryDocument } from 'src/core/schemas/curator-registry/curator-entry.schema';
import { BasePaginationDto } from 'src/pagination/dto/paginate.dto';
export enum SearchFieldFilter {
	displayedName = 'displayedName',
	orcid_id = 'orcid_id',
}
export class GetRegistryEntryDto extends BasePaginationDto {
	@IsEnum(SearchFieldFilter, {
		message: `filter field can only be one of these values ${Object.values(
			SearchFieldFilter,
		)}`,
	})
	@ApiPropertyOptional()
	@IsOptional()
	filter_field: SearchFieldFilter;

	@ApiPropertyOptional()
	@IsString()
	@ValidateIf((o) => o.filter_field)
	query: string;

	@ApiPropertyOptional()
	@IsArray()
	@IsOptional()
	resources?: string[];

	// Build the query filter
	buildQueryFilter(): FilterQuery<CuratorRegistryEntryDocument> {
		const query_filter: FilterQuery<CuratorRegistryEntryDocument> = {};
		const field =
			this.filter_field === 'orcid_id'
				? 'curator_orcid'
				: 'curator.displayedName';
		if (!!this.query) {
			// clean the userquery
			const cleanQuery = _.escapeRegExp(this.query);
			query_filter[field] = { $regex: `.*${cleanQuery}.*`, $options: 'i' };
		}
		// Queried resources
		if (!!this.resources && this.resources.length > 0) {
			query_filter['contributed_to'] = {
				$elemMatch: { resource_id: { $in: this.resources } },
			};
		}
		// Hide private users
		query_filter['$or'] = [
			{ privacy: PrivacyType.public },
			{ 'curator.privacy': PrivacyType.public },
		];
		return query_filter;
	}
}

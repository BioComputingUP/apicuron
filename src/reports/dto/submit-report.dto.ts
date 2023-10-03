import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsDate,
	IsDateString,
	IsEmpty,
	IsISO8601,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxDate,
	Validate,
	ValidateNested,
} from 'class-validator';
// import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
// import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { OrcidChecksum } from '../validators/orcid-checksum';
import { ApiProperty } from '@nestjs/swagger';
import {
	EntriesExistRule,
	EntryExistsRule,
} from '../../shared/validators/entry-exists.validator';
import { Term } from '../../core/schemas/terms.schema';
import { PartnerResource } from '../../core/schemas/resource.schema';
import { EntityUriValid } from '../validators/entity-uri';
import { Transform, Type } from 'class-transformer';
export class SubmitReportDto {
	@Validate(
		EntryExistsRule,
		[
			Term.name,
			({ activity_term, resource_id }) => {
				return {
					activity_term,
					resource_id,
				};
			},
		],
		{
			message: `the activity_term $value does not exist for this resource`,
		},
	)
	@IsNotEmpty()
	activity_term: string;

	@Validate(OrcidChecksum)
	@IsNotEmpty()
	curator_orcid: string;

	@Validate(EntityUriValid, [
		({ resource_id }: SubmitReportDto): string => resource_id,
	])
	@IsNotEmpty()
	entity_uri: string;

	@Validate(EntryExistsRule, [
		PartnerResource.name,
		({ resource_id }) => {
			return {
				resource_id,
			};
		},
	])
	@IsNotEmpty()
	resource_id: string;

	// This configuration is lenient and tolerates mistakes in the string specification
	@MaxDate(() => new Date(Date.now()), {
		message:
			'timestamp: The timestamp of a report cannot be set to a future date',
	})
	@IsDate()
	@Type(() => Date)
	// this is a more strict approach with better approach although we need to keep the instance a string
	// @IsISO8601()
	// @IsString()
	// @IsNotEmpty()
	timestamp: Date;
}

export class SubmitBulkDto {
	@ApiProperty({
		type: 'array',
		items: {
			type: 'string',
			example: 'disprot',
		},
		description:
			'A list of Resource Ids where the database manager specifies which resources he wishes to delete all the previous reports (effectively resubmitting everything through this bulk update) ',
		required: false,
	})
	// @IsArray()
	@IsString({ each: true })
	@IsOptional()
	delete_all: Array<string>;

	// swagger docs entry
	@ApiProperty({
		type: 'file',
		format: 'binary',
		description:
			'A JSON file containing a list named "reports" that contains reports for a curation',
	})
	@IsEmpty()
	reports: string;
}

export class SubmitReportsDto {
	@IsArray()
	@ValidateNested({ each: true })
	@ArrayMaxSize(50)
	@ArrayMinSize(0)
	@IsNotEmpty()
	@Type(() => SubmitReportDto)
	reports: SubmitReportDto[];

	@IsArray()
	@Validate(EntriesExistRule, [
		PartnerResource.name,
		({ delete_all }) => {
			return {
				resource_id: delete_all,
			};
		},
	])
	@IsString({ each: true })
	@IsOptional()
	delete_all: Array<string>;
}

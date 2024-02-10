import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
	IsBoolean,
	IsDate,
	IsEmpty,
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
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
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

	@ApiProperty({
		description:
			'The ORCID of the contributor who performed the activity, has to be a valid ORCID',
	})
	@Validate(OrcidChecksum)
	@IsString()
	@IsNotEmpty()
	curator_orcid: string;

	@ApiProperty({
		description:
			'The URI of the entity where the activity was performed, this can be a protein, a gene, a complex, a pathway, etc.',
	})
	@Validate(EntityUriValid, [
		({ resource_id }: SubmitReportDto): string => resource_id,
	])
	@IsNotEmpty()
	entity_uri: string;

	@ApiProperty({
		description:
			'The resource_id of the resource where the activity was performed',
	})
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

	@ApiProperty({
		description:
			'The Date of the activity performed by the contributor, has to be compliant with ISO8601',
	})
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

	@IsBoolean()
	@IsOptional()
	@Transform((val) => val ?? false)
	paid: boolean;
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

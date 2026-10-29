import {
	ArrayMaxSize,
	ArrayMinSize,
	IsArray,
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
import { EntityUriValid } from '../validators/entity-uri';
import { plainToInstance, Transform, Type } from 'class-transformer';
import { isPlainObject, pick } from 'lodash';
export class SubmitReportDto {
	@IsString()
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
	@IsString()
	@IsNotEmpty()
	entity_uri: string;

	@ApiProperty({
		description:
			'The resource_id of the resource where the activity was performed',
	})
	@IsString()
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

	@IsString()
	@IsOptional()
	league: string;
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

/**
 * Report fields that can be set once at the root of a submission instead of
 * being repeated in every report. A value set on a report overrides the global one.
 */
export const SUBMISSION_GLOBAL_FIELDS = [
	'resource_id',
	'activity_term',
	'curator_orcid',
	'entity_uri',
	'timestamp',
	'league',
] as const;

/**
 * Merges the global fields of a submission into each of its reports.
 * Non-object entries are left untouched so that validation reports them.
 */
export function mergeGlobalFields(
	submission: Record<string, unknown> | undefined,
): unknown {
	const reports: unknown = submission?.reports;
	if (!Array.isArray(reports)) {
		return reports;
	}
	const globals = pick(submission, SUBMISSION_GLOBAL_FIELDS);
	return reports.map((report: unknown) =>
		isPlainObject(report) || report instanceof SubmitReportDto
			? plainToInstance(SubmitReportDto, { ...globals, ...(report as object) })
			: report,
	);
}

export class SubmitReportsDto {
	@ApiProperty({
		type: [SubmitReportDto],
		description:
			'The list of reports, fields omitted from a report are taken from the global fields of the submission',
	})
	@IsArray()
	@ValidateNested({ each: true })
	@ArrayMaxSize(50)
	@ArrayMinSize(0)
	@IsNotEmpty()
	@Type(() => SubmitReportDto)
	@Transform(({ obj }) => mergeGlobalFields(obj))
	reports: SubmitReportDto[];

	// Global fields, validated on each report after being merged into it
	@ApiProperty({ required: false, description: 'Global resource_id' })
	@IsOptional()
	resource_id?: string;

	@ApiProperty({ required: false, description: 'Global activity_term' })
	@IsOptional()
	activity_term?: string;

	@ApiProperty({ required: false, description: 'Global curator_orcid' })
	@IsOptional()
	curator_orcid?: string;

	@ApiProperty({ required: false, description: 'Global entity_uri' })
	@IsOptional()
	entity_uri?: string;

	@ApiProperty({ required: false, description: 'Global timestamp' })
	@IsOptional()
	timestamp?: string;

	@ApiProperty({ required: false, description: 'Global league' })
	@IsOptional()
	league?: string;

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	delete_all?: Array<string>;
}

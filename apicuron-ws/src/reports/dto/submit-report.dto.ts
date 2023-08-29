import { IsArray, IsDate, IsDateString, IsEmail, IsEmpty, IsNotEmpty, IsOptional, IsUrl, Validate } from 'class-validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { OrcidChecksum } from '../validators/orcid-checksum';
import { ApiProperty } from '@nestjs/swagger';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { Term } from '../../core/schemas/terms.schema';
import { PartnerResource } from '../../core/schemas/resource.schema';
import { EntityUriValid } from '../validators/entity-uri';
import { Type } from 'class-transformer';
export class SubmitReportDto {

    @Validate(
        EntryExistsRule,
        [
            Term.name,
            ({ activity_term, resource_id }) => {
                return {
                    activity_term,
                    resource_id
                }
            }
        ],
        {
            message: `the activity_term $value does not exist for this resource`
        }
    )
    @IsNotEmpty()
    activity_term: string;

    @Validate(OrcidChecksum)
    @IsNotEmpty()
    curator_orcid: string;

    @Validate(EntityUriValid, [({ resource_id }: SubmitReportDto): string => resource_id])
    @IsNotEmpty()
    entity_uri: string;

    @Validate(EntryExistsRule, [
        PartnerResource.name,
        ({ resource_id }) => {
            return {
                resource_id
            }
        }
    ])
    @IsNotEmpty()
    resource_id: string;

    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    timestamp: Date;

}

export class SubmitBulkDto {

    @IsOptional()
    @ApiProperty({ type: 'string[]', format: 'String', description: 'A list of Resource Ids where the database manager specifies which resources he wishes to delete all the previous reports (effectively resubmitting everything through this bulk update) ', required: false })
    // @IsArray()
    delete_all: Array<string>

    // swagger docs entry
    @ApiProperty({ type: 'file', format: 'binary', description: 'A JSON file containing a list named "reports" that contains reports for a curation' })
    @IsEmpty()
    reports: string
}

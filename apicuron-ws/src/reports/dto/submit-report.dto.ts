import { IsArray, IsEmail, IsEmpty, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { OrcidChecksum } from '../validators/orcid-checksum';
import { ApiProperty } from '@nestjs/swagger';
import { EntryExistsRule } from '../../shared/validators/entry-exists.validator';
import { Term } from '../../terms/schemas/terms.schema';
import { PartnerResource } from '../../resources/schemas/partner-resources.schema';
export class SubmitReportDto {

    @IsNotEmpty()
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
    activity_term: string;

    @IsNotEmpty()
    @Validate(OrcidChecksum)
    curator_orcid: string;

    @IsNotEmpty()
    entity_uri: string;

    @IsNotEmpty()
    @Validate(EntryExistsRule, [
        PartnerResource.name,
        ({ resource_id }) => {
            return {
                resource_id
            }
        }
    ])
    resource_id: string;

    @IsNotEmpty()
    timestamp: Date;

}

export class SubmitBulkDto {

    @IsOptional()
    @ApiProperty({ type: 'string[]', format: 'String', description: 'A list of Resource Ids where the database manager specifies which resources he wishes to delete all the previous reports (effectively resubmitting everything through this bulk update) ', required: false })
    // @IsArray()
    delete_all: Array<string>

    // swagger docs entry
    @ApiProperty({ type: 'file', format:'binary', description: 'A JSON file containing a list named "reports" that contains reports for a curation' })
    @IsEmpty()
    reports: string
}

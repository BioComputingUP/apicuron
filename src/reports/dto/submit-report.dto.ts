import { IsArray, IsEmail, IsEmpty, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { ActivityTermExists } from '../../terms/validators/activity-term-exists';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { OrcidChecksum } from '../validators/orcid-checksum';
import { ApiProperty } from '@nestjs/swagger';
export class SubmitReportDto {

    @IsNotEmpty()
    @Validate(ActivityTermExists)
    activity_term: string;

    @IsNotEmpty()
    @Validate(OrcidChecksum)
	curator_orcid: string;

    @IsNotEmpty()
	entity_uri: string;

    @IsNotEmpty()
    @Validate(ResourceIdExists)
	resource_id: string;

    @IsNotEmpty()
	timestamp: Date;

}

export class SubmitBulkDto {
    
    @IsOptional()
    @ApiProperty({ type: 'string[]', format: 'String', description: 'A list of Resource Ids where the database manager can delete all the entries from the specified resourceIds', required:false })
    @IsArray()
    delete_all: Array<string>

    // swagger docs entry
    @ApiProperty({ type: 'File', format: 'JSON', description:'A JSON document containing a list named "reports" that contains reports for a curation' })
    @IsEmpty()
    reports: string
}

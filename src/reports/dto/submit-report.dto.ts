import { IsEmail, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { ActivityTermExists } from '../../resources/terms/validators/activity-term-exists';
import { ResourceIdExists } from '../../resources/partner-resources/validators/resource-id-exists';
import { OrcidChecksum } from '../validators/orcid-checksum';
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

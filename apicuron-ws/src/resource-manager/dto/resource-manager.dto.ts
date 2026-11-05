import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Matches, Validate } from 'class-validator';
import { SelectPartnerResourceDto } from 'src/resources/dto/partner-resources.entity';
import { OrcidChecksum } from 'src/submit-reports/validators/orcid-checksum';

const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
const ORCID_MESSAGE = 'orcid_id must be an ORCID iD like 0000-0002-0341-4888';

export class AddManagerDto {
	@ApiProperty({ example: '0000-0002-0341-4888' })
	@Validate(OrcidChecksum)
	@Matches(ORCID_PATTERN, { message: ORCID_MESSAGE })
	orcid_id: string;
}

export class ManagerParamsDto extends SelectPartnerResourceDto {
	@Validate(OrcidChecksum)
	@Matches(ORCID_PATTERN, { message: ORCID_MESSAGE })
	orcid_id: string;
}

export class ResourceManagerEntity {
	@ApiProperty()
	@Expose()
	orcid_id: string;

	@ApiProperty()
	@Expose()
	displayedName: string;
}

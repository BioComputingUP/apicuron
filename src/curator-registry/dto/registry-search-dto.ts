import { Expose, Type } from 'class-transformer';
import { RegistryCurator } from './registry-curator-dto';
import { ApiProperty } from '@nestjs/swagger';
import { StorageReference } from 'src/shared/decorators';

export class RegistryLeague {
	@ApiProperty()
	@Expose()
	displayedName: string;

	@ApiProperty()
	@Expose()
	resource_id: string;

	@ApiProperty()
	@Expose()
	name: string;
}

export class RegistryResource {
	@ApiProperty()
	@Expose()
	resource_id: string;

	@ApiProperty()
	@Expose()
	resource_name: string;

	@ApiProperty()
	@Expose()
	resource_description: string;

	@ApiProperty()
	@Expose()
	@StorageReference()
	logo: string;

	@ApiProperty()
	@Expose()
	resource_uri: string;
}

export class RegistryContributedTo {
	@ApiProperty()
	@Expose()
	resource_id: string;

	@ApiProperty({ type: () => RegistryResource })
	@Type(() => RegistryResource)
	@Expose()
	resource: RegistryResource;

	@ApiProperty({ type: () => [RegistryLeague] })
	@Type(() => RegistryLeague)
	@Expose()
	groups: RegistryLeague[];
}

export class RegistrySearchResultDto {
	@ApiProperty()
	@Expose()
	curator_orcid: string;

	@ApiProperty({ type: () => RegistryCurator })
	@Type(() => RegistryCurator)
	@Expose()
	curator: RegistryCurator;

	@ApiProperty({ type: () => [RegistryContributedTo] })
	@Type(() => RegistryContributedTo)
	@Expose()
	contributed_to: RegistryContributedTo[];
}

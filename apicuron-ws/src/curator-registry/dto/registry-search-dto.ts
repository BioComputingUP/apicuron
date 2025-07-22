import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { StorageReference } from 'src/shared/decorators';
import { RegistryCurator } from './registry-curator-dto';

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
	@StorageReference()
	@Expose()
	logo: string;

	@ApiProperty()
	@Expose()
	resource_uri: string;

	@ApiProperty()
	@Expose()
	resource_url: string;
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

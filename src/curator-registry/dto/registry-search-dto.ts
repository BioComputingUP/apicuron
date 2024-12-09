import { Expose, Type } from 'class-transformer';
import { RegistryCurator } from './registry-curator-dto';

export class RegistryLeague {
	@Expose()
	displayedName: string;

	@Expose()
	resource_id: string;
}

export class RegistryResource {
	@Expose()
	resource_id: string;

	@Expose()
	resource_name: string;

	@Expose()
	resource_description: string;

	@Expose()
	logo: string;

	@Expose()
	resource_uri: string;
}

export class RegistryContributedTo {
	@Expose()
	resource_id: string;

	@Type(() => RegistryResource)
	@Expose()
	resource: RegistryResource;

	@Type(() => RegistryLeague)
	@Expose()
	groups: RegistryLeague[];
}

export class RegistrySearchResultDto {
	@Expose()
	curator_orcid: string;

	@Type(() => RegistryCurator)
	@Expose()
	curator: RegistryCurator;

	@Type(() => RegistryContributedTo)
	@Expose()
	contributed_to: RegistryResource[];
}

import { Expose } from "class-transformer";

export class RegistryCurator {
	@Expose()
	displayedName: string;

	@Expose()
	orcid_id: string;

	@Expose()
	affiliation: string;

	@Expose()
	avatar: string;
}
export class CreateOrUpdateUserDto {
	displayedName: string;

	username: string;

	orcid_id: string;

	orcid_permission: string;

	orcid_scope: string;

	refresh_token: string;
}

export interface ICreateOrUpdateUser {
	displayedName?: string;

	username?: string;

	orcid_id: string;

	orcid_permission?: string;

	orcid_scope?: string;

	refresh_token?: string;
}

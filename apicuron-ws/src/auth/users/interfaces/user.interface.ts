export interface IUserEmailEntry {
	visibility: string;
	verified: boolean;
	primary: boolean;
	email: string;
}

export interface IUser {
	orcid_id: string;

	orcid_permission?: string;

	orcid_scope?: string;

	refresh_token?: string;

	displayedName: string;

	username?: string;

	gmail?: string;

	biography?: string;

	/**
	 * @deprecated
	 */
	email?: string;

	emails: IUserEmailEntry[];

	employment?: string;

	family_name?: string;

	given_name?: string;

	full_name: string;

	institution?: string;

	keywords?: string;
}

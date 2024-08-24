export interface OrcidEmailEntry {
	visibility: string;
	verified: boolean;
	primary: boolean;
	email: string;
}

export interface OrcidUser {
	orcid_id: string;
	orcid_permission: string;
}

export interface OrcidExternalId {
	type: 'uri';
	value: string;
	url: URL;
	relationship: 'self';
}

export interface OrcidWork {
	title: string;
	shortDescription: string;
	type: string;
	putCode?: string;
	externalIds: OrcidExternalId[];
}

export type SubmitWorkReponseWithCode = {
	status: 201;
	putCode: string;
};
export type SubmitWorkResponeWithoutCode = { status: Exclude<number, 201> };

export type SubmitWorkResponse =
	| SubmitWorkReponseWithCode
	| SubmitWorkResponeWithoutCode;

export interface OrcidClientModuleOptions {
	apiUrl: string;
	client_id: string;
	client_secret: string;
	scopes: string[];
	loadOnStartup?: boolean;
}

export interface OrcidAuthToken {
	access_token: string;
	token_type: string;
	refresh_token: string;
	expires_in: number;
	expires_at: number;
	scope: string;
	orcid: null;
}

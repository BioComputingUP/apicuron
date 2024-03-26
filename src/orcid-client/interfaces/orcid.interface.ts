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

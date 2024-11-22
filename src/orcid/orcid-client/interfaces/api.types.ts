export type OrcidApiJsonExternalId = {
	'external-id-type': string;
	'external-id-value': string;
	'external-id-url'?: {
		value: string;
	};
	'external-id-relationship': string;
};

export type OrcidApiJsonContributor = {
	'contributor-orcid': {
		uri: string;
		path: string;
		host: string;
	};
	'credit-name': {
		value: string;
	};
	'contributor-email'?: string | null;
	'contributor-attributes': {
		'contributor-sequence': string;
		'contributor-role': string;
	};
};

export type OrcidApiJsonWork = {
	title: {
		title: {
			value: string;
		};
		subtitle?: {
			value: string;
		};
		'translated-title'?: {
			value: string;
			'language-code': string;
		} | null;
	};
	'journal-title'?: {
		value: string;
	} | null;
	'short-description': string;
	citation?: {
		'citation-type': string;
		'citation-value': string;
	};
	type?: string;
	'publication-date'?: {
		year: {
			value: string;
		};
		month?: {
			value: string;
		};
		day?: {
			value: string;
		};
	};
	'external-ids': {
		'external-id': OrcidApiJsonExternalId[];
	};
	url?: {
		value: string;
	};
	contributors?: {
		contributor: OrcidApiJsonContributor[];
	};
	'language-code'?: string;
	country?: {
		value: string;
	};
};

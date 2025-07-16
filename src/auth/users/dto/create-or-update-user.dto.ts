import { PrivacyType } from 'src/core/enums';
import {
	UserEmployment,
	UserLinks,
} from 'src/core/schemas/components/user-fields.schema';

export class CreateOrUpdateUserDto {
	displayedName: string;

	username: string;

	orcid_id: string;

	orcid_permission: string;

	orcid_scope: string;

	refresh_token: string;
}
export interface ICreateUser {
	displayedName: string;
	username: string;

	orcid_id: string;

	orcid_permission: string;

	orcid_scope: string;

	refresh_token: string;
	// user info
	biography: string;

	keywords: string[];

	affiliation: string;

	links: UserLinks[];

	privacy: PrivacyType;

	lastLoginDate: Date;

	employment: UserEmployment[];
}
export interface ICreateOrUpdateUser {
	displayedName?: string;

	username?: string;

	orcid_id: string;

	orcid_permission?: string;

	orcid_scope?: string;

	refresh_token?: string;
	// user info
	biography?: string;

	keywords?: string[];

	affiliation?: string;

	links?: UserLinks[];

	privacy?: PrivacyType;

	lastLoginDate?: Date;

	employment?: UserEmployment[];
}

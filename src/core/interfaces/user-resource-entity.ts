import { HydratedDocument, LeanDocument } from 'mongoose';
import { PrivacyType } from '../enums';

// defines each entity that is associated with a resource (only) (terms, badge definition...etc)
export interface IResourceEntity {
	resource_id: string;

	privacy: PrivacyType;

	league: string;
}

export type IResourceEntityDocument = HydratedDocument<IResourceEntity>;
export type LeanIResourceEntityDocument = LeanDocument<IResourceEntityDocument>;

// defines each entity that is associated with a user and a resource (statistics, badge, medal and reports...etc)
export interface IUserResourceEntity extends IResourceEntity {
	curator_orcid: string;
}

export type IUserResourceEntityDocument = HydratedDocument<IUserResourceEntity>;
export type LeanIUserResourceEntityDocument =
	LeanDocument<IUserResourceEntityDocument>;

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const GithubAccountSource = { ORCID_RESEARCHER_URL: 'orcid_researcher_url' } as const;
export type GithubAccountSource = (typeof GithubAccountSource)[keyof typeof GithubAccountSource];

export const GithubAccountStatus = { ACTIVE: 'active', CONFLICT: 'conflict' } as const;
export type GithubAccountStatus = (typeof GithubAccountStatus)[keyof typeof GithubAccountStatus];

@Schema({ _id: false })
export class GithubAccount {
	@Prop({ required: true, type: String })
	github_id: string; // numeric GitHub ID

	@Prop({ required: true, type: String })
	login: string; // readable login, at the time of linking

	@Prop({ required: true, type: String, enum: Object.values(GithubAccountSource) })
	source: GithubAccountSource;

	@Prop({ required: true, type: Date })
	first_observed_at: Date;

	@Prop({ required: true, type: Date })
	last_verified_at: Date;

	@Prop({ required: true, type: String, enum: Object.values(GithubAccountStatus) })
	status: GithubAccountStatus;
}

export const GithubAccountSchema = SchemaFactory.createForClass(GithubAccount);
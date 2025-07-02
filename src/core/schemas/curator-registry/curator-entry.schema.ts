import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, LeanDocument, ObjectId, Types } from 'mongoose';
import { PrivacyType } from 'src/core/enums';
import { LeagueDocument, LeagueSchema } from '../league/league.schema';
import {
	PartnerResource,
	PartnerResourceSchema,
} from '../resource/partner-resource.schema';
import { User, UserSchema } from '../user.schema';

export type CuratorRegistryEntryDocument =
	HydratedDocument<CuratorRegistryEntry>;
export type LeanCuratorRegistryEntryDocument =
	LeanDocument<CuratorRegistryEntryDocument>;
@Schema({ _id: false })
export class ContributionEntry {
	@Prop({ required: true })
	resource_id: string;

	@Prop({ type: PartnerResourceSchema })
	resource: Types.Subdocument<ObjectId> & PartnerResource;

	@Prop({ type: [LeagueSchema] })
	groups: Types.DocumentArray<LeagueDocument>;
}

export type ContributionEntryDocument = HydratedDocument<ContributionEntry>;
export type LeanContributionEntryDocument =
	LeanDocument<ContributionEntryDocument>;

const ContributionEntrySchema =
	SchemaFactory.createForClass(ContributionEntry).loadClass(ContributionEntry);
@Schema({
	collection: 'curator-registry',
})
export class CuratorRegistryEntry {
	@Prop({ required: true, unique: true })
	curator_orcid: string;

	@Prop({
		required: true,
		enum: PrivacyType,
		type: String,
		default: PrivacyType.private,
	})
	privacy: PrivacyType;

	@Prop({
		required: false,
		type: UserSchema,
	})
	curator: Types.Subdocument<ObjectId> & User;

	@Prop({ required: true, type: [ContributionEntrySchema], default: () => [] })
	contributed_to: Types.DocumentArray<ContributionEntryDocument>;
}

const CuratorRegistryEntrySchema =
	SchemaFactory.createForClass(CuratorRegistryEntry).loadClass(
		CuratorRegistryEntry,
	);

CuratorRegistryEntrySchema.index({
	'curator.displayedName': 'text',
	'curator.orcid_id': 'text',
	curator_orcid: 'text',
});

CuratorRegistryEntrySchema.index(
	{
		curator_orcid: 1,
	},
	{ unique: true, name: 'unique_curator_orcid' },
);

CuratorRegistryEntrySchema.index({
	'curator.displayedName': -1,
	'curator.orcid_id': -1,
	curator_orcid: -1,
	privacy: -1,
});

export { CuratorRegistryEntrySchema };

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
	FilterQuery,
	HydratedDocument,
	LeanDocument,
	Model,
	ObjectId,
	ProjectionType,
	QueryOptions,
	Types,
} from 'mongoose';
import { PrivacyType } from 'src/core/enums';
import { League, LeagueDocument, LeagueSchema } from '../league/league.schema';
import {
	PartnerResource,
	PartnerResourceSchema,
} from '../resource/partner-resource.schema';
import { User, UserSchema } from '../user.schema';

// Subdocument types for Registry Entry

type ContributionEntryOverride = {
	resource: Types.Subdocument<ObjectId> & PartnerResource;
	groups: Types.DocumentArray<LeagueDocument>;
};

export type ContributionEntryDocument = HydratedDocument<
	ContributionEntry,
	ContributionEntryOverride
>;
export type LeanContributionEntryDocument = LeanDocument<ContributionEntry>;

@Schema({ _id: false })
export class ContributionEntry {
	@Prop({ required: true })
	resource_id: string;

	@Prop({ type: PartnerResourceSchema })
	resource: PartnerResource;

	@Prop({ type: [LeagueSchema] })
	groups: League[];
}

// Main Schema for Collection:

type CuratorRegistryOverride = {
	contributed_to: Types.DocumentArray<ContributionEntry>;
	curator: (Types.Subdocument<ObjectId> & User) | null;
};

export type LeanCuratorRegistryEntryDocument =
	LeanDocument<CuratorRegistryEntry>;
export type CuratorRegistryEntryModel = Model<
	CuratorRegistryEntry,
	Record<string, never>,
	CuratorRegistryOverride
>;
export type CuratorRegistryEntryDocument = HydratedDocument<
	CuratorRegistryEntry,
	CuratorRegistryOverride
>;
export type CuratorRegistryEntryFilter = FilterQuery<CuratorRegistryEntry>;
export type CuratorRegistryEntryProjection =
	ProjectionType<CuratorRegistryEntry>;
export type CuratorRegistryEntryQueryOptions =
	QueryOptions<CuratorRegistryEntry>;

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
	curator: User | null;

	@Prop({ required: true, type: [ContributionEntrySchema], default: () => [] })
	contributed_to: ContributionEntry[];
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

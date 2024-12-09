import { HydratedDocument } from 'mongoose';
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { User, UserSchema } from '../user.schema';
import {
	PartnerResource,
	PartnerResourceSchema,
} from '../resource/partner-resource.schema';
import { League, LeagueSchema } from '../league/league.schema';

export type CuratorRegistryEntryDocument =
	HydratedDocument<CuratorRegistryEntry>;
@Schema({ _id: false })
export class ContributionEntry {
	@Prop({ required: true })
	resource_id: string;

	@Prop({ type: PartnerResourceSchema })
	resource: PartnerResource;

	@Prop({ type: [LeagueSchema] })
	groups: [League];
}
const ContributionEntrySchema =
	SchemaFactory.createForClass(ContributionEntry).loadClass(ContributionEntry);
@Schema({
	collection: 'curator-registry',
})
export class CuratorRegistryEntry {
	@Prop({ required: true, unique: true })
	curator_orcid: string;

	@Prop({
		required: false,
		type: UserSchema,
	})
	curator: User;

	@Prop({ required: false, type: [ContributionEntrySchema] })
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

CuratorRegistryEntrySchema.index({
	'curator.displayedName': -1,
	'curator.orcid_id': -1,
	curator_orcid: -1,
	'curator.privacy': -1,
});

export { CuratorRegistryEntrySchema };

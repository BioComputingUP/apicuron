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
	@Prop({ required: true })
	curator_orcid: string;

	@Prop({
		required: true,
		type: UserSchema,
	})
	curator: User;

	@Prop({ required: false, type: [ContributionEntrySchema] })
	contributed_to: ContributionEntry[];
}

export const CuratorRegistryEntrySchema =
	SchemaFactory.createForClass(CuratorRegistryEntry).loadClass(
		CuratorRegistryEntry,
	);

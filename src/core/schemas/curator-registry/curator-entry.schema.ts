import { HydratedDocument } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { User, UserSchema } from "../user.schema";
import { PartnerResource, PartnerResourceSchema } from "../resource/partner-resource.schema";
import { League, LeagueSchema } from "../league/league.schema";
export type CuratorRegistryEntryDocument = HydratedDocument<CuratorRegistryEntry>
@Schema()
export class CuratorGroupEntry{

	@Prop({required: true})
	resource_id: string

	@Prop({type: [LeagueSchema]})
	groups_ids : [League]
}
@Schema({
	collection: 'curator-registry',
})
export class CuratorRegistryEntry {
	@Prop({
		required: true,
		type: UserSchema
	})
	curator: User;

	@Prop({type: [PartnerResourceSchema]})
	contributed_to: PartnerResource[];


	@Prop({required: false})
	groups: CuratorGroupEntry;
}

export const CuratorRegistryEntrySchema = SchemaFactory.createForClass(CuratorRegistryEntry).loadClass(CuratorRegistryEntry);
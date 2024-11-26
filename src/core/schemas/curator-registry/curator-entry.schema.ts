import { HydratedDocument } from "mongoose";
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { CuratorResourceEntry, CuratorResourceEntrySchema } from "../components/curator-resource.schema";
export type CuratorEntryDocument = HydratedDocument<CuratorEntry>

@Schema({
	collection: 'curator-registry',
})
export class CuratorEntry {
	@Prop({required: true, unique: true})
	curator_orcid: string

	@Prop({required: true})
	displayedName: string
	
	@Prop({required: true})
	user_privacy: boolean

	@Prop({type: [CuratorResourceEntrySchema]})
	contributed_to: CuratorResourceEntry[]


	@Prop({ required: false, default: ()=> ""})
	affiliation?: string
	
}

export function CuratorEntrySchemaFactory() {
	const CuratorEntrySchema =
		SchemaFactory.createForClass(CuratorEntry).loadClass(
			CuratorEntry,
		);
	return CuratorEntrySchema;

}
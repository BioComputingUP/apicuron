import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class CuratorResourceEntry{

	@Prop({required: true})
	resource_id: string

	@Prop({required: true})
	resource_displayed_name: string


	@Prop({default: ()=>["default"]})
	visibleGroups : [string]

	@Prop()
	hiddenGroups: [string]
}

export const CuratorResourceEntrySchema =
	SchemaFactory.createForClass(CuratorResourceEntry);
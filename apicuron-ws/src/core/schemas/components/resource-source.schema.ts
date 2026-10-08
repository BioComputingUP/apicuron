import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export const SourceSystem = { GITHUB: 'github' } as const;
export type SourceSystem = (typeof SourceSystem)[keyof typeof SourceSystem];

@Schema({ _id: false })
export class ResourceSource {
	@Prop({ required: true, type: String, enum: Object.values(SourceSystem) })
	system: SourceSystem;

	@Prop({ required: true, type: String })
	repository_id: string;

	@Prop({ required: true, type: String })
	full_name: string;

	@Prop({ required: true, type: Date })
	linked_at: Date;
}

export const ResourceSourceSchema =
	SchemaFactory.createForClass(ResourceSource);

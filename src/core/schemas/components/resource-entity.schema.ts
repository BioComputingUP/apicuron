import { Prop } from '@nestjs/mongoose';
import { PrivacyType } from '../../enums';
import { Document, HydratedDocument } from 'mongoose';

export type ResourceEntityDocument = HydratedDocument<ResourceEntity>;
export class ResourceEntity extends Document {
	@Prop({ required: true, type: String })
	resource_id: string;

	@Prop({ required: true, type: String, enum: PrivacyType })
	privacy: PrivacyType;

	@Prop({ required: true })
	league: string;
}

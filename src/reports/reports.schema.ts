import { Schema, Prop } from '@nestjs/mongoose';

@Schema({ collection: 'users' })
export class ReportsSchema {
	@Prop({ required: true })
	activity_term: string;
	@Prop({ required: true })
	curator_orcid: string;
	@Prop({ required: true })
	entity_uri: string;
	@Prop({ required: true })
	resource_uri: string;
	@Prop({ required: true })
	timestamp: Date;
}

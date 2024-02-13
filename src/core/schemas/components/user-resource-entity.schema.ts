import { Prop } from '@nestjs/mongoose';
import { ResourceEntity } from './resource-entity.schema';
import { HydratedDocument } from 'mongoose';

export type UserResourceEntityDocument = HydratedDocument<UserResourceEntity>;
export class UserResourceEntity extends ResourceEntity {
	@Prop({ required: true, type: String })
	curator_orcid: string;
}

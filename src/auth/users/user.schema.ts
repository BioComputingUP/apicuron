import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;
export interface UserResource {
  id: string;
  name: string;
}

@Schema({ collection: 'users' })
export class User {
  @Prop()
  id: string;

  @Prop()
  biography: string;

  @Prop()
  cookie_token: string;

  @Prop()
  displayedName: string;

  @Prop()
  email: string;

  /// Could not determine type the field only had null or empty values in the sample set.
  @Prop()
  employment: string;

  @Prop()
  family_name: string;

  @Prop()
  full_name: string;

  @Prop()
  given_name: string;

  @Prop()
  gmail: string;

  @Prop()
  institution: string;

  @Prop()
  jwt_token: string;

  /// Could not determine type the field only had null or empty values in the sample set.
  @Prop()
  keywords: string;

  @Prop()
  last_update: string;

  @Prop()
  profile_picture: string;

  @Prop()
  role: string;

  @Prop()
  username: string;

  @Prop({ required: true })
  orcid_id: string;

  @Prop()
  resources: UserResource[];
}

export const UserSchema = SchemaFactory.createForClass(User);

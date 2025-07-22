import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Expose } from 'class-transformer';

@Schema()
export class UserEmployment {
	@Prop()
	name: string;

	@Prop()
	title?: string;

	@Prop()
	url?: string;

	@Prop()
	start_date?: string;

	@Prop()
	end_date?: string;
}

export const UserEmploymentSchema =
	SchemaFactory.createForClass(UserEmployment);

@Schema()
export class UserLinks {
	@Prop()
	@Expose()
	name: string;

	@Prop()
	@Expose()
	url: URL;
}

export const UserLinksSchema = SchemaFactory.createForClass(UserLinks);

import { Schema, SchemaFactory } from "@nestjs/mongoose";

export type BadgeDocument = Badge & Document;

@Schema({ collection: 'achievements_def' })
export class Badge {
    // fields from Achievement
    id: string;
	category: string;
	color: string;
	count_threshold: number;
	
	name: string;
	resource_uri: string;
	list_terms: string[];

	type: string;


    // Fields specific for Badge
	color_code: string;
}

export const BadgeSchema = SchemaFactory.createForClass(Badge);

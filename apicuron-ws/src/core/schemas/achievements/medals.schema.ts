import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { FilterQuery, HydratedDocument, Model, ObjectId, ProjectionType, QueryOptions, Types } from 'mongoose';
import { AchievementState, PrivacyType } from '../../enums';
import { IUserResourceEntity } from '../../interfaces/user-resource-entity';
import { User, UserSchema } from '../user.schema';

export type MedalDocumentOverride = {
	user: (Types.Subdocument<Types.ObjectId> & User) | null;
};


export type MedalModel = Model<Medal, {}, MedalDocumentOverride>;
export type MedalDocument =  HydratedDocument<Medal, MedalDocumentOverride>;
export type MedalFilter = FilterQuery<Medal>;
export type MedalProjection = ProjectionType<Medal>;
export type MedalQueryOptions = QueryOptions<Medal>;

@Schema({ collection: 'achievements', timestamps: true })
/**
 * Represents a medal in the system.
 */
export class Medal implements IUserResourceEntity {
	/**
	 * The date and time when the medal was created.
	 */
	createdAt: Date;

	/**
	 * The date and time when the medal was last updated.
	 */
	updatedAt: Date;

	@Prop({
		required: false,
		type: UserSchema,
	})
	user: User;

	/**
	 * The color of the medal.
	 */
	@Prop({
		required: false,
	})
	color: string;

	/**
	 * The ID of the resource associated with the medal.
	 */
	@Prop({
		required: true,
	})
	resource_id: string;

	/**
	 * The number represents the ranking of the curator when classified using the specified medal among other curators
	 */
	@Prop({
		required: false,
	})
	count_relative_index: number;

	/**
	 * Indicates whether the relative count of the medal is valid.
	 */
	@Prop({
		required: false,
	})
	count_relative_valid: boolean;

	/**
	 * Indicates whether the threshold count of the medal is valid.
	 */
	@Prop({
		required: false,
	})
	count_threshold_valid: boolean;

	/**
	 * The total count of the medal.
	 */
	@Prop({
		required: true,
	})
	count_total: number;

	/**
	 * The ORCID of the curator associated with the medal.
	 */
	curator_orcid: string;

	/**
	 * The name of the medal.
	 */
	@Prop({
		required: true,
	})
	name: string;

	/**
	 * The URI of the resource associated with the medal.
	 */
	@Prop({
		required: false,
	})
	resource_uri: string;

	/**
	 * The relative score of the medal.
	 */
	@Prop({
		required: true,
	})
	score_relative: number;

	/**
	 * The relative index score of the medal.
	 */
	@Prop({
		required: true,
	})
	score_relative_index: number;

	/**
	 * Indicates whether the relative score of the medal is valid.
	 */
	@Prop({
		required: false,
	})
	score_relative_valid: boolean;

	/**
	 * Indicates whether the threshold score of the medal is valid.
	 */
	@Prop({
		required: false,
	})
	score_threshold_valid: boolean;

	/**
	 * The total score of the medal.
	 */
	@Prop({
		required: true,
	})
	score_total: number;

	/**
	 * The list of terms associated with the medal.
	 */
	@Prop({
		required: false,
	})
	list_terms: string[];

	/**
	 * The league of the medal.
	 */
	@Prop({
		required: true,
		type: String,
	})
	league: string;

	/**
	 * The privacy type of the medal.
	 */
	@Prop({
		required: true,
		type: String,
	})
	privacy: PrivacyType;

	/**
	 * The state of the achievement associated with the medal.
	 */
	@Prop({
		required: true,
		type: String,
	})
	state: AchievementState;

	@Prop({ required: false, type: Date })
	last_day?: Date;

	@Prop({ required: false, type: Date })
	first_day?: Date;
}

export const MedalSchema = SchemaFactory.createForClass(Medal).loadClass(Medal);

export class EarnedMedal extends Medal {}
export const EarnedMedalSchema =
	SchemaFactory.createForClass(EarnedMedal).loadClass(EarnedMedal);

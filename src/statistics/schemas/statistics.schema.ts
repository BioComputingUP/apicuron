import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { StatisticsTerms } from './statistics-terms.schema';

export type StatisticsDocument = Statistics & Document;
@Schema({
	collection: 'statistics',
	
	// toJSON: { virtuals: true },
	// toObject: { virtuals: true },
})
export class Statistics {
    @Prop({required: true})
    badges_count:number;

    @Prop({required: true})
    curator_orcid:string;

    @Prop({required: true, type: 'Number' })
    generation_count: number;

    @Prop({required: true})
    generation_score: number;

    generation_terms:[StatisticsTerms]
    /// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
    @Prop({required: true})
    invalidation_count:number;

    /// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
    @Prop({required: true})
    invalidation_score:number;

    invalidation_terms:[StatisticsTerms]
    @Prop({required: true})
    medals_count:number;

    @Prop({required: true})
    ranking:number;

    @Prop({required: false })
    resource_uri:string;

    @Prop({required: true})
    resource_id:string;

    /// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
    @Prop({required: true})
    revision_count:number;

    /// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
    @Prop({required: true})
    revision_score:number;

    @Prop({required: true})
    revision_terms:[StatisticsTerms]

    @Prop({required: true})
    total_score:number
}


export const StatisticsSchema = SchemaFactory.createForClass(Statistics);

// StatisticsSchema.virtual('user', {
//     ref: 'User',
//     localField: 'curator_orcid',
//     foreignField: 'orcid_id'
//   });
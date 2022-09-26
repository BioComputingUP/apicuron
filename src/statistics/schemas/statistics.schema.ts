import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { StatisticsTerms } from './statistics-terms.schema';

export type StatisticsDocument = Statistics & Document;
@Schema({
	collection: 'statistics',
	
	toJSON: { virtuals: true },
	// toObject: { virtuals: true },
})
export class Statistics {
    badges_count:number;

    curator_orcid:string;
    generation_count: string;
    generation_score: string;
    generation_terms:[StatisticsTerms]
    /// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
    invalidation_count:number;
    /// Multiple data types found: Float: 28.1%, Int: 71.9% out of 89 sampled entries
    invalidation_score:number;
    invalidation_ter:[StatisticsTerms]
    medals_count:number;
    ranking:number;
    resource_uri:string;
    /// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
    revision_count:number;
    /// Multiple data types found: Float: 15.7%, Int: 84.3% out of 89 sampled entries
    revision_score:number;
    revision_terms:[StatisticsTerms]
    total_score:number;
}


export const StatisticsSchema = SchemaFactory.createForClass(Statistics);

StatisticsSchema.virtual('user', {
    ref: 'User',
    localField: 'curator_orcid',
    foreignField: 'orcid_id'
  });
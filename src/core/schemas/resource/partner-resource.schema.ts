import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { ContributionType } from '../../enums';
import { HydratedDocument } from 'mongoose';
import { AchievementDef } from '../achievement-def.schema';
import { Term } from '../terms.schema';
import {
	ResourceLeague,
	defaultResourceLeague,
} from '../league/resource-league.schema';

export type PartnerResourceDocument = HydratedDocument<PartnerResource>;

// this class defines a partnerResource that has been validated and has the ability to have Models, Badges and so on

@Schema()
export class PartnerResource {
	@Prop()
	resource_description: string;

	@Prop({ required: true, unique: true })
	resource_id: string;

	@Prop()
	resource_long_name: string;

	@Prop({ required: true, unique: true })
	resource_name: string;

	@Prop({ required: true, unique: true })
	resource_uri: string;

	@Prop({ required: true, unique: true })
	resource_url: string;

	@Prop({ required: false })
	logo: string;

	@Prop()
	color: string;

	state: string;

	@Prop({
		required: true,
		default: defaultResourceLeague,
	})
	leagues: ResourceLeague;

	// getCuratorContributionType(curator_id: string): ContributionType {
	// 	return this.professional_curators.includes(curator_id)
	// 		? ContributionType.professional
	// 		: ContributionType.community;
	// }

	// hasProfessionalCurator(
	// 	this: PartnerResourceDocument,
	// 	curator_orcid: string,
	// ): boolean {
	// 	return this.professional_curators.includes(curator_orcid);
	// }
}
const PartnerResourceSchema =
	SchemaFactory.createForClass(PartnerResource).loadClass(PartnerResource);

export class ResourceSummary extends PartnerResource {
	badges: AchievementDef[];
	medals: AchievementDef[];
	terms: Term[];
}

export { PartnerResourceSchema };

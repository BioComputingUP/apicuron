import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Badge, BadgeDocument } from './schemas/badges.schema';
import { Medal, MedalDocument } from './schemas/medals.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
	ResourceSummary,
} from './schemas/partner-resources.schema';
import { Term, TermDocument } from './schemas/terms.schema';

@Injectable()
export class PartnerResourcesService {
	constructor(
		@InjectModel(PartnerResource.name)
		private partnerResourceModel: Model<PartnerResourceDocument>,
		@InjectModel('badge') private badgeModel: Model<BadgeDocument>,
		@InjectModel('medal') private medalModel: Model<MedalDocument>,
		@InjectModel(Term.name) private termDefModel: Model<TermDocument>,
	) {}
	async get_resources(): Promise<PartnerResource[]> {
		return await this.partnerResourceModel.find();
	}

	async resources_details(): Promise<ResourceSummary[]> {
		const resources = await this.partnerResourceModel.find(
			{},
			{},
			{ lean: true },
		);

		const output = await Promise.all(
			resources.map(async (element) => {
				const badgesPromise = this.badgeModel.find({
					resource_uri: element.resource_uri,
				});
				const termsDefPromise = this.termDefModel.find({
					resource_uri: element.resource_uri
				})
				const medalsPromise = this.medalModel.find({
					resource_uri: element.resource_uri,
				});
				const [badges, medals, terms] = await Promise.all([
					badgesPromise,
					medalsPromise,
					termsDefPromise
				]);
				return { ...element, badges, medals, terms };
			}),
		);

		return output;
	}
}

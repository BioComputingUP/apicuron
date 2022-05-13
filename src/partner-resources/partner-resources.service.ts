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

@Injectable()
export class PartnerResourcesService {
	constructor(
		@InjectModel(PartnerResource.name)
		private partnerResourceModel: Model<PartnerResourceDocument>,
		@InjectModel('badge') private badgeModel: Model<BadgeDocument>,
		@InjectModel('medal') private medalModel: Model<MedalDocument>,
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
				const medalsPromise = this.medalModel.find({
					resource_uri: element.resource_uri,
				});
				const [badges, medals] = await Promise.all([
					badgesPromise,
					medalsPromise,
				]);
				return { ...element, badges, medals };
			}),
		);

		return output;
	}
}

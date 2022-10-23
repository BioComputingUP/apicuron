import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
	ResourceSummary,
} from '../schemas/partner-resources.schema';
import { Term, TermDocument } from '../schemas/terms.schema';
import { User, UserDocument } from '../../auth/users/schemas/user.schema';
import { Report, ReportDocument } from '../../reports/reports.schema';
import { AchievementsDefService } from '../../achievements/achievements-def.service';
import { TransformerService } from '../../shared/transformer/transformer.service';
import { UpdatePartnerResourceDto } from '../dto/updateResource.dto';

@Injectable()
export class PartnerResourcesService {
	constructor(
		@InjectModel(PartnerResource.name)
		private partnerResourceModel: Model<PartnerResourceDocument>,
		@InjectModel(Term.name) private termDefModel: Model<TermDocument>,
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Report.name) private reportModel: Model<ReportDocument>,
		protected achievementService: AchievementsDefService,
		protected transformService: TransformerService
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
				const { resource_uri } = element;
				// console.log('Ressource', element.resource_uri)
				const badgesPromise = this.achievementService.get_badges(resource_uri);
				const medalsPromise = this.achievementService.get_medals(resource_uri);
				const termsDefPromise = this.termDefModel.find({
					resource_uri,
				});
				const [badges, medals, terms] = await Promise.all([
					badgesPromise,
					medalsPromise,
					termsDefPromise,
				]);
				return { ...element, badges, medals, terms };
			}),
		);

		return output;
	}

	async get_counts() {
		const achievement_count = this.achievementService.count();
		const user_count = this.userModel.count();
		const report_count = this.reportModel.count();
		return Promise.all([achievement_count, user_count, report_count]);
	}

	async count() {
		return await this.partnerResourceModel.count();
	}

	async get_resource_details(resource_id: string, page = 1, page_size = 10) {
		const resource = await this.partnerResourceModel
			.findOne({
				resource_id,
			})
			.lean();
		if (!resource) {
			return null;
		}
		const { resource_uri } = resource;
		const badgesPromise = this.achievementService.get_badges(resource_id, resource_uri);
		const medalsPromise = this.achievementService.get_medals(resource_id, resource_uri);

		const termsPromise = this.termDefModel.find({
			resource_uri,
		});

		const skip = (page - 1) * page_size;
		const reportsPromise = this.reportModel
			.find({
				resource_uri: resource.resource_uri,
			})
			.skip(skip)
			.limit(page_size);

		let [medals, badges, reports, terms] = await Promise.all([
			medalsPromise,
			badgesPromise,
			reportsPromise,
			termsPromise,
		]);
		return {
			resource,
			medals,
			badges,
			reports,
			terms,
		};
	}

	async retrieve_uri(resource_id: string){
		const resource = await this.partnerResourceModel.findOne({ resource_id })
		if(!resource){
			this.transformService.warn('resource_id', `Incorrect resource_id: ${resource_id} Not found, parameter ignored`)
			return null
		}else{
			return resource.resource_uri
		}
	}

	async get_resource(resource_id: string){
		return await this.partnerResourceModel.findOne({ resource_id })
	}

	async exists(resource_id: string): Promise<Boolean> {
		return !! await this.partnerResourceModel.exists({ resource_id })
	}

	async update_resource(resource_update: UpdatePartnerResourceDto & { logo?: string }){
		const { resource_id } = resource_update

		return await this.partnerResourceModel.updateOne({ resource_id }, resource_update);

	}
}

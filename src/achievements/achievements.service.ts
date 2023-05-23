import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { AchievementsDefService } from './achievements-def.service';
import { Badge, BadgeDocument } from './schemas/badges.schema';
import { Medal, MedalDocument } from './schemas/medals.schema';

@Injectable()
export class AchievementsService {
	constructor(
        protected partnerResourceService: PartnerResourcesService,
		@InjectModel('badge') protected badgeModel: Model<BadgeDocument>,
		@InjectModel('medal') protected medalModel: Model<MedalDocument>,
	) {}

    async user_achievements(curator_orcid: string, resource_id: string){
        const resource_uri = await this.partnerResourceService.retrieve_uri(resource_id)
        const badgesPromise = this.badgeModel.find({
            curator_orcid,
            '$or': [
                { resource_id },
                { resource_uri }
            ]
        })
        const medalsPromise = this.medalModel.find({
            curator_orcid,
            '$or': [
                { resource_id },
                { resource_uri }
            ]
        })
        const [badges, medals] = await Promise.all([badgesPromise, medalsPromise])
        return {
            badges,
            medals
        }
    }


    public async delete_resource_badges(resource_id: string){
        return await this.badgeModel.deleteMany({
            resource_id
        })
    }

    public async delete_user_resource_badges(resource_id: string, orcid_id: string){
        await this.badgeModel.deleteMany({
            resource_id,
            curator_orcid: orcid_id
        })
    }

    public async delete_resource_medals(resource_id: string){
        return await this.medalModel.deleteMany({
            resource_id
        })
    }

    public async user_badge_count(resource_id: string, curator_orcid: string){
        return await this.badgeModel.count({ resource_id, curator_orcid })
    }


    public async user_medal_count(resource_id: string, curator_orcid: string){
        return await this.medalModel.count({ resource_id, curator_orcid })
    }

}

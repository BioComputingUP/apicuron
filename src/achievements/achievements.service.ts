import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Badge, BadgeDocument } from './schemas/badges.schema';
import { Medal, MedalDocument } from './schemas/medals.schema';

@Injectable()
export class AchievementsService {
	constructor(
		@InjectModel('badge') protected badgeModel: Model<BadgeDocument>,
		@InjectModel('medal') protected medalModel: Model<MedalDocument>,
	) {}

    async user_achievements(curator_orcid: string, resource_uri: string){
        const badgesPromise = this.badgeModel.find({
            curator_orcid,
            resource_uri
        })
        const medalsPromise = this.medalModel.find({
            curator_orcid,
            resource_uri
        })
        const [badges, medals] = await Promise.all([badgesPromise, medalsPromise])
        return {
            badges,
            medals
        }
    }
}

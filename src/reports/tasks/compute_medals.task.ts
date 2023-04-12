
import { Injectable, Logger } from '@nestjs/common'
import { ReportsService } from '../reports.service';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { AchievementsDefService } from '../../achievements/achievements-def.service';
import { AchievementsService } from '../../achievements/achievements.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../../auth/users/users.service';
import { Medal, MedalDocument } from '../../achievements/schemas/medals.schema';
import { Report, ReportDocument } from '../reports.schema';
import { MedalDef } from '../../achievements/schemas/medals_def.schema';
import { AchievementDef } from '../../achievements/schemas/achievement-def.schema';

@Injectable()
export class ComputeMedalsTask {
    constructor(protected partnerResourceService: PartnerResourcesService,
        protected userService: UsersService,
        protected achievementsService: AchievementsService,
        protected achievementsDefService: AchievementsDefService,
        @InjectModel('medal') protected medalModel: Model<MedalDocument>,
        @InjectModel(Report.name) private reportModel: Model<ReportDocument>,
        protected reportService: ReportsService) {

    }

    logger = new Logger(ComputeMedalsTask.name)

    public async run_task(resource_id: string) {
        const resource = await this.partnerResourceService.get_resource(resource_id)

        if (!resource) {
            this.logger.error(`Resource ${resource_id} not found ! Aborting`)
            return
        }
        await this.compute_resource_medals(resource_id)
    }

    async compute_resource_medals(resource_id: string) {
        await this.achievementsService.delete_resource_medals(resource_id);

        const medalDefs = await this.achievementsDefService.get_medals({ resource_id })

        let medal_saves_promises = []

        for (let i = 0; i < medalDefs.length; i++) {
            // for each medal definition in the list, we add the medal to the user 
            const medalDef = medalDefs[i];
            const user_reports = this.medal_reports_aggregation(medalDef).limit(medalDef.score_relative).cursor()

            // user_reports is sorted based on their scores, we just need to load the 'n' first
            // users where 'n' is the score_relative of the medal
            let score_relative_index = 0
            for await (const user of user_reports) {
                if (user) {
                    const medal = new this.medalModel({
                        ...medalDef.toObject(),
                        _id: null,
                        curator_orcid: user['_id']['curator_orcid'],
                        'count_total': user['count'],
                        'score_total': user['score_sum'],
                        score_relative_index,
                        count_relative_valid: true,
                        count_threshold_valid: true,
                        score_threshold_valid: true
                    })
                    score_relative_index++
                    medal_saves_promises.push(medal.save());
                }
            }
        }

        await Promise.all(medal_saves_promises)

    }

    private medal_reports_aggregation(medal: AchievementDef) {

        // first we first filter all the reports by the resource
        // and the terms that are concerned by the medals 
        let match_dict = {
            'resource_id': medal.resource_id,
            'activity_term': {
                '$in': medal.list_terms
            }
        }

        // if the medal has a time constraint we make sure it's added to the filter
        if (medal.first_day) {
            match_dict['timestamp'] = { '$gte': medal.first_day }
        }

        if (medal.last_day) {
            // if the timestamp object doesn't exist, it is created otherwise it is updated
            if (!match_dict['timestamp']) {
                match_dict['timestamp'] = { '$lte': medal.last_day }
            } else {
                match_dict['timestamp'] = { ...match_dict['timestamp'], '$lte': medal.last_day }
            }
        }
        return this.reportModel.aggregate().
            match(match_dict).
            // # here we lookup and unwind from the terms_def collection to get the term score
            lookup({
                'from': 'terms_def',
                'localField': 'activity_term',
                'foreignField': 'activity_term',
                'as': 'result'
            }).
            unwind({ path: '$result' }).
            project({
                'curator_orcid': 1,
                'activity_term': 1,
                'score': '$result.score'
            }).
            // # here we group by curator while computing the count ans score sum
            group({
                '_id': {
                    'curator_orcid': '$curator_orcid'
                },
                'count': {
                    '$sum': 1
                },
                'score_sum': {
                    '$sum': '$score'
                }
            }).
            // and we sort the output in decreasing order based on the score_sum
            sort({
                'score_sum': -1
            })

    }
}
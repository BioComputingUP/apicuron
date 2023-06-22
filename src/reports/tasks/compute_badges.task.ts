import { Injectable, Logger } from '@nestjs/common'
import { ReportsService } from '../reports.service';
import { PartnerResourcesService } from '../../resources/partner-resources/partner-resources.service';
import { AchievementsDefService } from '../../achievements/achievements-def.service';
import { AchievementsService } from '../../achievements/achievements.service';
import { PartnerResource } from '../../resources/schemas/partner-resources.schema';
import { Badge, BadgeDocument } from '../../achievements/schemas/badges.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../../auth/users/users.service';
import { TaskArgument } from '../../scheduler-client/types/baseTask';
import { Report, ReportDocument } from '../../reports/reports.schema';
import { Term, TermDocument } from '../../terms/schemas/terms.schema';
import { AchievementDef, AchievementDefDocument } from '../../achievements/schemas/achievement-def.schema';

@Injectable()
export class ComputeBadgesTask {
    constructor(protected partnerResourceService: PartnerResourcesService,
        protected userService: UsersService,
        protected achievementsService: AchievementsService,
        protected achievementsDefService: AchievementsDefService,
        @InjectModel('badge') protected badgeModel: Model<BadgeDocument>,
        @InjectModel(AchievementDef.name) private achievementDefModel: Model<AchievementDefDocument>,
        @InjectModel(Report.name) protected reportModel: Model<ReportDocument>,
        // @InjectModel(Term.name) protected termModel: Model<TermDocument>,
        protected reportService: ReportsService) {

    }

    logger = new Logger(ComputeBadgesTask.name)

    public async run_task(task_arg: TaskArgument) {


        const [resource_id, orcid_id] = task_arg.arguments
        const resource = await this.partnerResourceService.get_resource(resource_id)

        if (!resource) {
            this.logger.error(`Resource ${resource_id} not found ! Aborting`)
            return
        }

        if (orcid_id) {
            this.logger.log(`Computing Badges for user ${orcid_id} for resource ${resource_id}`)

            const user = await this.userService.get_by_orcid(orcid_id)
            if (user) {
                await this.computeUserBadges(resource_id, orcid_id)
            } else {
                this.logger.error(`User ${orcid_id} Not found !!`)
            }
        } else {
            this.logger.log(`Computing Badges for resource ${resource_id}`)

            await this.computeResourceBadges(resource)
        }

    }


    public async computeResourceBadges({ resource_id }: PartnerResource) {
        const curators = await this.reportModel.aggregate([
            {
                $group: {
                    _id: '$curator_orcid'
                }
            }
        ])

        const orcid_ids = curators.map((entry) => entry._id);

        const userBadgesPromises = orcid_ids.map((orcid_id) => this.computeUserBadges(resource_id, orcid_id))

        return await Promise.all(userBadgesPromises)

    }

    public async computeUserBadges(resource_id: string, curator_orcid: string) {

        // Iterate Over reports from the oldest to newest
        const userReportsIterator = this.reportModel.find({ resource_id, curator_orcid }, {}, { $sort: { timestamp: 1 } }).cursor();

        const resourceBadgeCount = await this.achievementDefModel.count({ resource_id, type: 'badge' })

        // create a map to store Achieved Tasks of the curator
        const achievedTasks = new Map<string, number>()

        // create an array to store earned badges and when they were earned
        const earnedBadges: string[] = []

        const badgeUpdatePromises = []


        // while iterating each report in order
        for await (const report of userReportsIterator) {

            // before doing anything, we check if the user earned all the badges
            // threrfore no additional processing is required
            if (resourceBadgeCount === earnedBadges.length) {
                break;
            }

            // we check on our achievedTasks Map if the task has already been added
            if (achievedTasks.has(report.activity_term)) {
                // if the task has been added the value is updated
                let achieved = achievedTasks.get(report.activity_term)
                achieved += 1
                achievedTasks.set(report.activity_term, achieved);
            } else {
                // otherwise, it is initialized to 1
                achievedTasks.set(report.activity_term, 1)
            }

            // we then query all the non-earned badges
            const badgeDefIterator = this.achievementDefModel.find({ resource_id, type: 'badge', name: { $nin: earnedBadges } }).cursor()

            for await (const badge of badgeDefIterator) {
                if (badge.list_terms.includes(report.activity_term)) {
                    // check if the badge is earned
                    const concernedTasks = [...achievedTasks].filter(([key, value]) => badge.list_terms.includes(key))

                    const count = concernedTasks.map(([term, count]) => count).reduce((a, b) => a + b, 0)

                    if (count > badge.count_threshold) {
                        this.logger.log(`user ${curator_orcid} has earned the badge: ${badge.name}`)
                        // badge is earned at this moment
                        earnedBadges.push(badge.name)
                        const badgeObject = badge.toObject();
                        delete badgeObject._id;

                        const badgeUpdatePromise = this.badgeModel.updateOne({ resource_id, curator_orcid, name: badge.name }, {
                            $set: {
                                curator_orcid,
                                ...badgeObject,
                                earned_at: report.timestamp,
                                count
                            }
                        }, { upsert: true })

                        badgeUpdatePromises.push(badgeUpdatePromise);
                    }
                }
            }
        }

        return await Promise.all(badgeUpdatePromises)
    }

}
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

@Injectable()
export class ComputeBadgesTask {
    constructor(protected partnerResourceService: PartnerResourcesService,
        protected userService: UsersService,
        protected achievementsService: AchievementsService,
        protected achievementsDefService: AchievementsDefService,
        @InjectModel('badge') protected badgeModel: Model<BadgeDocument>,
        protected reportService: ReportsService) {

    }

    logger = new Logger(ComputeBadgesTask.name)

    public async run_task(task_arg: TaskArgument) {


        const [resource_id, orcid_id] = task_arg.arguments
        const resource = await this.partnerResourceService.get_resource(resource_id)

        if(!resource){
            this.logger.error(`Resource ${resource_id} not found ! Aborting`)
            return
        }

        if(orcid_id){
            this.logger.log(`Computing Badges for user ${orcid_id} for resource ${resource_id}`)

            const user = await this.userService.get_by_orcid(orcid_id)
            if(user){
                await this.compute_user_badges(resource_id, orcid_id)
            }else{
                this.logger.error(`User ${orcid_id} Not found !!`)
            }
        }else{
            this.logger.log(`Computing Badges for resource ${resource_id}`)

            await this.compute_resource_badges(resource)
        }

    }

    public async compute_resource_badges({ resource_id }: PartnerResource){
        await this.achievementsService.delete_resource_badges(resource_id)

        let badgesDef = await this.achievementsDefService.get_badges({ resource_id })

        let user_reports = this.reportService.group_resource_reports_by_activities(resource_id)

        let save_promises = []

        for await (const user of user_reports) {

            badgesDef.forEach(badgeDef => {
                // this.logger.log(`For Badge ${badgeDef.name}: terms count is ${badgeDef.list_terms.length}`)
                // get the list of user contributions that are concerned by the current badge
                const user_concerned_terms = user.terms.filter(term => {
                    // this.logger.log('Term: ' + term.activity_term)
                    return badgeDef.list_terms.includes(term.activity_term)
                })

                this.logger.log('User concerned terms: ', JSON.stringify(user_concerned_terms))
                // compute the terms sum to get the total number of contributions related to the current badge
                const terms_count = user_concerned_terms.reduce((acc, curr) => {
                    return acc + curr.count
                }, 0)
                // this.logger.log(`user concerned terms: ${user_concerned_terms.length}`)
                this.logger.log(`Terms count ${terms_count}, badge ${badgeDef.name} threshold ${badgeDef.count_threshold}`)

                // if the user has more contributions than the badge, he gets the badge
                if(terms_count >= badgeDef.count_threshold){
                    const user_badge = new this.badgeModel({
                        ...badgeDef.toObject(),
                        count: terms_count,
                        curator_orcid: user._id.curator_orcid,
                    })


                    
                    save_promises.push(user_badge.save());
                    this.logger.log(`User ${user._id.curator_orcid} earned ${badgeDef.name} badge`)
                }



            });
        }

        await Promise.all(save_promises)

    }

    public async compute_user_badges(resource_id: string, orcid_id: string){
        const user_reports = this.reportService.user_resource_reports(resource_id, orcid_id)
        const badgesDef: Array<any> = await this.achievementsDefService.get_badges({ resource_id })

        for await (const report of user_reports) {
            let term = report.activity_term
            // for each badge defined by the resource
            for (let i = 0; i < badgesDef.length; i++) {
                // if the user has a report that belongs to the list of badges, the badge count is incremented
                if(badgesDef[i]['list_terms'].includes(term)){
                    badgesDef[i]['count'] = (badgesDef[i]['count'] || 0) + 1
                }
            }
        }

        // we compute the obtained badges (that have count > count_threshold)

        const obtained_badges = badgesDef.filter(badge => {
            return (badge['count'] || 0) > badge['count_threshold']
        })

        // we delete the old badges

        await this.achievementsService.delete_user_resource_badges(resource_id, orcid_id);

        // we create an array to store the promises
        let save_promises = []

        this.logger.log(`User ${orcid_id} earned ${obtained_badges.length} Badges`)
        
        // for each badge obtained we insert it into the database asynchronously
        obtained_badges.forEach(obtained_badge => {
            const badge = new this.badgeModel({
                ...obtained_badge,
                curator_orcid: orcid_id,
                count: obtained_badge['count'] || 0
            })
            save_promises.push(badge.save())
        });

        // we await all the save promises
        await Promise.all(save_promises)
    }
}
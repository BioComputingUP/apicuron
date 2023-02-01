import { Injectable, Logger, Inject } from '@nestjs/common'
import { ComputeBadgesTask } from './compute_badges.task';
import { ComputeMedalsTask } from './compute_medals.task';


@Injectable()
export class ComputeAchievementsTask {

    constructor(
        @Inject('task:compute_badges') protected computeBadgesTask: ComputeBadgesTask,
        @Inject('task:compute_medals') protected computeMedalsTask: ComputeMedalsTask) {
    }

    public async run_task(resource_id: string, orcid_id: string | null = null) {
        if (orcid_id) {
            await this.computeBadgesTask.run_task(resource_id, orcid_id)
        } else {
            const badgesPromise = this.computeBadgesTask.run_task(resource_id)
            const medalsPromise = this.computeMedalsTask.run_task(resource_id)
            await Promise.all([badgesPromise, medalsPromise])
        }
    }
}
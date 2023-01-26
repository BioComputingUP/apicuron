import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../auth/users/users.service';
import { existsSync } from 'fs';
import { InjectModel } from '@nestjs/mongoose';
import { Report } from '../../reports/reports.schema';
import { Model } from 'mongoose';
import { ReportsParser } from '../reports.parser';
@Injectable()
export class SchedulerService {

    constructor(public authService: AuthService,
        public userService: UsersService,
        @InjectModel(Report.name) protected reportModel: Model<Report>,
        protected reportParser: ReportsParser)
        {
            this.tasks = ['test_task', 'submit_bulk']
        }
    tasks = ['test_task', 'submit_bulk']
    


    async run_task(task: string, file: string | null, ...args) {
        let tasks = ['test_task', 'submit_bulk']
        if (!tasks.includes(task)) {
            throw new Error(`Task ${task} does not exist`)
        }
        await this[task](file, ...args)
    }

    private test_task(file = null, resource_id: string, orcid_id = null) {
        console.log({
            resource_id,
            orcid_id,
            file
        })
        return;
    }


    private async submit_bulk(file: string, ...args) {


        const [orcid_id, delete_all] = args;

        if (!orcid_id) {
            throw new Error("orcid id required for the submission")
        }

        const user = await this.userService.get_by_orcid(orcid_id);

        // if (!user || !user.resources) {
        //     throw new UnauthorizedException("user has no permission to submit to resources");
        // }

        // const user_resource_ids = user.resources.map(({ resource_id }) => { return resource_id })

        if (!file || !existsSync(file)) {
            throw new Error("File is either unset or path is invalid");
        }

        // const defaultReport = await this.reportParser.parse_default_report(file)


        // const execution_report = await this.reportParser.process_reports(file, defaultReport)

        // console.log(execution_report)
    }
}

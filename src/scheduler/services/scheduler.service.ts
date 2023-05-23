import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../../auth/users/users.service';
import { existsSync } from 'fs';
import { build_report_stream, parse_default_report, ReportProcessReport, ValidatedReport } from '../reports.parser';
import { User } from '../../auth/users/schemas/user.schema';
import { ReportsService } from '../../reports/reports.service';
import { ValidationError } from 'class-validator';
@Injectable()
export class SchedulerService {

    constructor(
        public userService: UsersService,
        public reportService: ReportsService,
        ) {
        // this.tasks = ['test_task', 'submit_bulk']
    }
    tasks = ['test_task', 'submit_bulk']

    logger= new Logger(SchedulerService.name)


    async run_task(task: string, file: string | null, ...args) {
        // let tasks = ['test_task', 'submit_bulk']
        if (!this.tasks.includes(task)) {
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


   

    
}

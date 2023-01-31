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

        const defaultReport = await parse_default_report(file)

        const test = await this.process_reports(file, defaultReport, user)


        // const execution_report = await this.reportParser.process_reports(file, defaultReport)

        // console.log(execution_report)
    }

    // private async compute_statistics(resource_id: string, orcid_id: null | string =null){
    //     if()
    // }


    private process_reports(file: string, defaultReport: any, user: User): Promise<ReportProcessReport> {
        const reportsStream = build_report_stream(file, defaultReport, user)

        return new Promise((resolve, reject) => {
            let error_report = [];
            let successful_reports_count = 0
            let total_report_count = 0
            reportsStream.on('data', async ({ errors, report }: ValidatedReport) => {
                total_report_count++;
                if (errors.length == 0) {
                    successful_reports_count += 1
                    try {
                        await this.reportService.insertReport(report)
                    }catch(e){
                        if(e){
                            this.logger.error(e?.message || e, e?.stack)
                        }else{
                            this.logger.error(`Error Inserting the report \n ${report}`)
                        }
                        error_report.push({
                            target: report,
                            property: 'all',
                            constraints: {
                                'UnprocessableDocument': 'Cannot process report'
                            }
                        })
                    }

                } else {
                    error_report = error_report.concat(errors)
                }

            })

            reportsStream.on('end', () => {
                resolve({ errors: error_report, success_count: successful_reports_count, total_report_count })
            })

            reportsStream.on('error', (error) => {
                reject(error)
            })
        })
    }
}

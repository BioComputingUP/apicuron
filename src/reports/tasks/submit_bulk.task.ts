import { Injectable, Logger } from '@nestjs/common'
import { SubmitReportDto } from '../../reports/dto/submit-report.dto';

import * as StreamObject from 'stream-json/streamers/StreamObject';
import { createReadStream } from 'fs';
import { filter } from 'stream-json/filters/Filter';
import { parser } from 'stream-json';
import { verifier } from 'stream-json/utils/Verifier';
import { Stream, chain } from 'stream-chain';
import { pick } from 'stream-json/filters/Pick';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { validate, ValidationError } from 'class-validator';
import { User } from '../../auth/users/schemas/user.schema';
import { ReportsService } from '../../reports/reports.service';
import { UsersService } from '../../auth/users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';

export type ValidatedReport = { report: SubmitReportDto, errors: ValidationError[] };
export type ReportProcessReport = { errors: ValidationError[], success_count: number, total_report_count: number };

@Injectable()
export class SubmitBulkTask {
    constructor(protected reportService: ReportsService, protected userService: UsersService, protected notificationsService: NotificationsService) {

    }

    logger = new Logger(SubmitBulkTask.name)


    public async run_task(file: string, orcid_id: string, delete_all: string | null = null) {

        // console.log('delete_all: ', delete_all)

        if (delete_all) {
            const resources_delete_all: string[] = delete_all.split(',');

            for (let i = 0; i < resources_delete_all.length; i++) {
                await this.reportService.delete_all_resource_reports(resources_delete_all[i])

            }
        }
        return await this.main(file, orcid_id)
    }

    private async main(file: string, orcid_id: string) {
        try {
            const defaultReport = await this.parse_default_report(file)
            const user = await this.userService.get_by_orcid(orcid_id);
            const reportsStream = this.build_report_stream(file, defaultReport, user)

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
                        } catch (e) {
                            if (e) {
                                console.log('hi')
                                this.logger.error(e?.message || e, e?.stack)
                            } else {
                                console.log('how')
                                this.logger.error(`Error Inserting the report \n ${report}`)
                            }
                            error_report.push({
                                target: report,
                                property: 'all',
                                constraints: {
                                    'InsertionError': 'Cannot insert report'
                                }
                            })
                        }

                    } else {
                        error_report = error_report.concat(errors)
                    }

                })

                reportsStream.on('end', async () => {
                    const notification_body = this.build_notification_body(error_report, successful_reports_count, total_report_count)

                    await this.notificationsService.create_user_notification(
                        "Submission report",
                        notification_body,
                        orcid_id
                    )
                    resolve({ errors: error_report, success_count: successful_reports_count, total_report_count })
                })

                reportsStream.on('error', (error) => {
                    console.log('---------------')
                    this.logger.error(error)
                    reject(error)
                })
            })
        } catch (e) {

            await this.notificationsService.create_user_notification(
                'Submission Failed',
                `Error: ${e.message} `,
                orcid_id
            )

            
        }


    }

    private build_notification_body(error_reports: Array<any>, success_count: number, total_count: number) {

        function error_report_to_text(report: any) {

            const constraints = Object.entries(report.constraints).map(([name, err]) => { return `- ${name}: ${err}` }).join('\n')

            let text = `
            For Report:
            ${report.target}
            Errors:
            ${constraints}
            `
            return text
        }

        let submission_report = []
        if(success_count > 0){
            submission_report = [
                `Successfully submitted ${success_count}/${total_count}:`
            ]
        }else{
            submission_report = [
                `Submission failed!`
            ]
        }
        


        if (error_reports.length > 0) {
            submission_report.push(
                `Failed to submit ${error_reports.length}: `
            )
            submission_report.push(
                ...error_reports.map(error_report_to_text)
            )
        }
        return submission_report.join('\n')
    }


    private parse_default_report(file: string): Promise<Object> {

        // create read stream from file
        const objectStream = new StreamObject()
        // const verifierStream = createReadStream(file).pipe(verifier())



        return new Promise(
            (resolve, reject) => {

                try {

                    // extract parser stream
                    const parserStream = parser()


                    const defaultsStream = parserStream
                        .pipe(filter({ filter: /^(?!reports).*$/ }))
                        .pipe(objectStream)
                    const defaultReport = {}

                    defaultsStream.on('data', ({ key, value }) => {
                        defaultReport[key] = value;
                    })

                    parserStream.on('error', (error) => {
                        reject(error)
                    })

                    defaultsStream.on('end', () => {
                        resolve(defaultReport)
                    })
                    createReadStream(file).pipe(parserStream)
                } catch (e) {
                    reject(e)
                }

            }
        )
    }

    private build_report_stream(file, defaultReport, user: User): Stream {

        const pipeline = createReadStream(file).pipe(parser());

        const reportsPipeline = pipeline.pipe(pick({ filter: 'reports' }));

        const reportsStream = reportsPipeline.pipe(chain([
            new StreamArray(), // convert stream to array
            ({ key, value }) => value, // extract the value
            (report) => { return { ...defaultReport, ...report } }, // merge the defaultReport and the report
            this.convert_object_to_report, // convert instances to SubmitReportDto,
            this.validate_report, // validate report and extract errors
            this.user_can_report(user), // validate if user has permission to submit report
        ]));
        return reportsStream
    }

    private async validate_report(report: SubmitReportDto): Promise<ValidatedReport> {
        try {
            const validation_errors: ValidationError[] = await validate(report)

            return {
                report,
                errors: validation_errors
            }
        } catch (e: unknown) {
            if (e) {
                console.error('Error Validating report: \n', report)
            }
            return {
                report,
                errors: [
                    {
                        target: report,
                        property: 'all',
                        constraints: {
                            'ProcessingError': 'The report document is not processable'
                        }
                    }
                ]
            }
        }




    }

    private user_can_report(user) {
        const user_resources = user.resources.map(({ resource_id }) => resource_id)
        return ({ report, errors }: ValidatedReport) => {
            if (user_resources.includes(report.resource_id)) {
                return { report, errors }
            } else {
                errors.push({
                    target: report,
                    property: 'resource_id',
                    value: report.resource_id,
                    constraints: {
                        'UserSubmitPermission': `The user ${user.orcid_id} does not have permission to submit to the resource ${report.resource_id}`
                    },
                    children: []
                })
                return { report, errors }
            }
        }
    }


    private convert_object_to_report(obj: SubmitReportDto) {
        const report = new SubmitReportDto();
        report.activity_term = obj.activity_term;
        report.curator_orcid = obj.curator_orcid;
        report.entity_uri = obj.entity_uri;
        report.timestamp = obj.timestamp;
        report.resource_id = obj.resource_id;

        return report;
    }


}
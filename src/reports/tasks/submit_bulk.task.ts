import { Injectable, Logger } from '@nestjs/common'
import { SubmitReportDto } from '../../reports/dto/submit-report.dto';

import * as StreamObject from 'stream-json/streamers/StreamObject';
import { createReadStream } from 'fs';
import { filter } from 'stream-json/filters/Filter';
import { parser } from 'stream-json';
import { Stream, chain } from 'stream-chain';
import { pick } from 'stream-json/filters/Pick';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { validate, ValidationError } from 'class-validator';
import { User } from '../../auth/users/schemas/user.schema';
import { ReportsService } from '../../reports/reports.service';
import { UsersService } from '../../auth/users/users.service';

export type ValidatedReport = { report: SubmitReportDto, errors: ValidationError[] };
export type ReportProcessReport = { errors: ValidationError[], success_count: number, total_report_count: number };

@Injectable()
export class SubmitBulkTask {
    constructor(protected reportService: ReportsService, protected userService: UsersService) {

    }

    logger = new Logger(SubmitBulkTask.name)


    public async run_task(file: string, orcid_id: string, delete_all: string | null = null){
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



    private parse_default_report(file: string): Promise<Object> {

        // create read stream from file
        const objectStream = new StreamObject()
        const defaultsStream = createReadStream(file)
            .pipe(parser())
            .pipe(filter({ filter: /^(?!reports).*$/ }))
            .pipe(objectStream)

        return new Promise(
            (resolve, reject) => {
                const defaultReport = {}
                defaultsStream.on('data', ({ key, value }) => {
                    defaultReport[key] = value;
                })

                defaultsStream.on('end', () => {
                    resolve(defaultReport)
                })
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
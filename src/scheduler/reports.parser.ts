
import * as StreamObject from 'stream-json/streamers/StreamObject';
import { createReadStream, existsSync } from 'fs';
import { filter } from 'stream-json/filters/Filter';
import { parser } from 'stream-json';
import { pick } from 'stream-json/filters/Pick';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { SubmitReportDto } from '../reports/dto/submit-report.dto';
import { ReportDto } from '../reports/dto/report.dto';
import { validate, ValidationError } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class ReportsParser {

    constructor(protected reportsService: ReportsService) { }

    parse_default_report(file: string): Promise<Object> {

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


    process_reports(file: string, defaultReport: any): Promise<{ errors: ValidationError[], success_count: number }> {

        // internal Node readable stream option, pipe to stream-json to convert it for us
        const pipeline = createReadStream(file).pipe(parser());

        const reportsPipeline = pipeline.pipe(pick({ filter: 'reports' }));

        const reportsStream = reportsPipeline.pipe(new StreamArray());

        // reportsStream.pause();

        return new Promise((resolve, reject) => {
            let errors = [];
            let successful_reports_count = 0
            reportsStream.on('data', async (data) => {
                // extract the value of the stream entry
                const report_obj = data['value']
                // convert Object to an instance of ReportDto
                const report: SubmitReportDto = this.convert_object_to_report({ ...defaultReport, ...report_obj });

                // validate Report 
                const validation_errors: ValidationError[] = await validate(report)

                // if report has errors, add them to the report
                if (validation_errors.length > 0) {
                    errors.concat(validation_errors)
                } else {
                    await this.reportsService.insertReport(report)
                    successful_reports_count++
                }
            })

            reportsStream.on('end', () => {
                resolve({ errors, success_count: successful_reports_count })
            })

            reportsStream.on('error', (error) => {
                reject(error)
            })
        })




    }


    convert_object_to_report(obj: ReportDto) {
        const report = new SubmitReportDto();
        report.activity_term = obj.activity_term;
        report.curator_orcid = obj.curator_orcid;
        report.entity_uri = obj.entity_uri;
        report.timestamp = obj.timestamp;
        report.resource_id = obj.resource_id;

        return report;
    }

}


import * as StreamObject from 'stream-json/streamers/StreamObject';
import { createReadStream } from 'fs';
import { filter } from 'stream-json/filters/Filter';
import { parser } from 'stream-json';
import { Stream, chain } from 'stream-chain';
import { pick } from 'stream-json/filters/Pick';
import * as StreamArray from 'stream-json/streamers/StreamArray';
import { SubmitReportDto } from '../reports/dto/submit-report.dto';
import { validate, ValidationError } from 'class-validator';
import { User } from '../core/schemas/user.schema';

export type ValidatedReport = {report: SubmitReportDto, errors:ValidationError[] };
export type ReportProcessReport = { errors: ValidationError[], success_count: number, total_report_count: number };


export function parse_default_report(file: string): Promise<Object> {

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

export function build_report_stream(file, defaultReport, user:User): Stream {
    const pipeline = createReadStream(file).pipe(parser());

    const reportsPipeline = pipeline.pipe(pick({ filter: 'reports' }));

    const reportsStream = reportsPipeline.pipe(chain([
        new StreamArray(), // convert stream to array
        ({key, value}) => value, // extract the value
        (report) => { return { ...defaultReport, ...report }}, // merge the defaultReport and the report
        convert_object_to_report, // convert instances to SubmitReportDto,
        validate_report, // validate report and extract errors
        user_can_report(user), // validate if user has permission to submit report
    ]));
    return reportsStream
}


async function validate_report(report: SubmitReportDto): Promise<ValidatedReport>{
    try {
        const validation_errors: ValidationError[] = await validate(report)

        return {
            report,
            errors: validation_errors
        }
    }catch(e: unknown) {
        if(e){
            console.error('Error Validating report: \n',report)
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

function user_can_report(user) {
    const user_resources = user.resources.map(({resource_id}) => resource_id)
    return ({ report , errors }: ValidatedReport) => {
        if(user_resources.includes(report.resource_id)){
            return { report, errors }
        }else{
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


function convert_object_to_report(obj: SubmitReportDto) {
    const report = new SubmitReportDto();
    report.activity_term = obj.activity_term;
    report.curator_orcid = obj.curator_orcid;
    report.entity_uri = obj.entity_uri;
    report.timestamp = obj.timestamp;
    report.resource_id = obj.resource_id;

    return report;
}


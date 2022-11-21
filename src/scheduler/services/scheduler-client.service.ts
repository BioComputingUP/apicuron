import { Injectable, Logger } from '@nestjs/common';
import { IncomingMessage, request } from 'http';
import * as FormData from 'form-data';
import { TaskSubmit } from '../types/baseTask';
import { ConfigService } from '@nestjs/config';
import { createReadStream, fstatSync } from 'fs';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';

// const FormData = require('form-data')
@Injectable()
export class SchedulerClientService {

    constructor(protected config: ConfigService, protected http: HttpService) {}

    private url = 'https://scheduler.biocomputingup.it/task/'

    private schedulerLogger = new Logger(SchedulerClientService.name);

    private task_name = 'apicuron_tasks'
    private database_host = this.config.get('db_host')
    private database = this.config.get('database')

    async submit_task(task: TaskSubmit){
        const form = this.base_form();

        form.append('task', task.task)
        if(task.task_arguments) {
            form.append('task_arguments', task.task_arguments)
        }
        if(task.file){
            form.append('task_file_argument', createReadStream(task.file.path), {
                filename: task.file.originalname,
                contentType: task.file.mimetype,
                knownLength: task.file.size
            })
        }

        // in this part, we will convert this callback to a promise
        return new Promise(
            // to define a promise we need to pass a function that calls the resolve and reject consumer passed functions
            (resolve: Function, reject: Function) => {
                // in this part we will use the form.submit function to call the API
                // and call the reject/resolve methods accordingly in the callback Function
                form.submit(this.url, (err: Error, response: IncomingMessage) => {
                    if(err){
                        reject(err)
                    }else{
                        resolve(response)
                    }
                })
            }
        )

        // const config = { headers: { 'Content-Type': 'multipart/form-data' } };
        // return await this.http.axiosRef.post(this.url, form, config)
        
    }

    private base_form(): FormData {

        const form = new FormData();

        form.append('task_name', this.task_name)
        form.append('database_host', this.database_host)
        form.append('database', this.database)

        return form
    }



    async test_task() {
        const response = await this.submit_task({
            task: 'test_task',
            task_arguments: 'hello world'
        }).catch((reason) => {
            this.schedulerLogger.error(reason)
        })
        return response;
    }

    /**
     * 
     * @param {Object} reports (Multer.File object describing the file containing the curation data )
     * @param {String} orcid_id (The submitter of the data)
     * @param {String[]} delete_all (list of resources to delete wipe the )
     * @description This function takes three params 
     * @returns 
     */

    async submit_reports(reports: Express.Multer.File, orcid_id: string, delete_all: string[]){
        const response = await this.submit_task({
            task: 'submit_report',
            task_arguments: `${orcid_id} ${delete_all.join(',')}`,
            file: reports
        }).catch((err) => {
            this.schedulerLogger.error(err)
        })

        return response['data']
    }

    /**
     * 
     * @param resource_id resource id of the resource to compute the statistics
     * @param orcid_id optional orcid_id if this triggers a re-compute of the orcid_id
     */
    async compute_statistics(resource_id: string, orcid_id= ''){
        
        const response = await this.submit_task({
            task: 'compute_statistics',
            task_arguments: `${resource_id} ${orcid_id}`,
        }).catch((err) => {
            this.schedulerLogger.error(err);
        })

        return response['data']
    }

    /**
     * 
     * @param resource_id resource id of the resource to compute the statistics
     * @param orcid_id optional orcid_id if this triggers a re-compute of the orcid_id
     */
    async compute_achievements(resource_id: string, orcid_id= ''){
        const response = await this.submit_task({
            task: 'compute_achievements',
            task_arguments: `${resource_id} ${orcid_id}`,
        }).catch((err) => {
            this.schedulerLogger.error(err);
        })

        return response['data']
    }

    @Cron('0 */30 * * * *')
    async add_resource_id(){
        const response = await this.submit_task({
            task: 'add_resource_id'
        }).catch((err) => {
            this.schedulerLogger.error(err);
        })

        return response['data']
    }
}

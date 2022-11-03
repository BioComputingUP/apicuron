import { Injectable } from '@nestjs/common';
import { IncomingMessage, request } from 'http';
import * as FormData from 'form-data';
import { TaskSubmit } from '../types/baseTask';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';

@Injectable()
export class SchedulerService {

    constructor(protected config: ConfigService) {}

    private url = 'https://scheduler.biocomputingup.it/task/'

    private task_name = 'apicuron_tasks'
    private database_host = this.config.get('db_host')
    private database = this.config.get('database')

    async submit_task(task: TaskSubmit){
        const form = this.base_form();

        form.append('task', task.task)
        form.append('task_arguments', task.task_arguments)
        form.append('task_file_argument', createReadStream(task.file.path), task.file.meta)

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
    }

    private base_form(): FormData {

        const form = new FormData();

        form.append('task_name', this.task_name)
        form.append('database_host', this.database_host)
        form.append('database', this.database)

        return form
    }
}

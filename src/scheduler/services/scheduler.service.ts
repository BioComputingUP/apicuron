import { Injectable } from '@nestjs/common';

@Injectable()
export class SchedulerService {

    tasks = {
        'test_task': this.test_task
    }

    get_tasks(): Array<string> {
        return Object.keys(this.tasks)
    }

    run_task(task: string, ...args){
        if(!this.get_tasks().includes(task)){
           throw new Error(`Task ${task} does not exist`)
        }
        this.tasks[task](args)
    }

    private test_task(thing: any){
        console.log(thing)  
        return;
    }


    private submit_bulk(orcid_id: string, delete_all: Boolean, file: String){
        
    }
}

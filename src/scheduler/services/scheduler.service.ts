import { Injectable } from '@nestjs/common';

@Injectable()
export class SchedulerService {

    tasks = {
        'test_task': this.test_task
    }

    get_tasks(){
        return Object.keys(this.tasks)
    }

    run_task(task: string, ...args){
        if(task in this.get_tasks()){
           this.tasks[task](args)
        }
    }

    private test_task(thing: any){
        console.log(thing)
        return;
    }
}

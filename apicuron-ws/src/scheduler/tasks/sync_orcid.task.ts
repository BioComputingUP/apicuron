import { Injectable } from '@nestjs/common';
import { TaskArgument } from '../../scheduler-client/types/baseTask';


@Injectable()
export class SyncOrcidTask {
    
    public async run_task(task_arg: TaskArgument) {
        
    }
}
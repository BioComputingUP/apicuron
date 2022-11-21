import { Controller, Get, Query } from '@nestjs/common'
import { SchedulerClientService } from './services/scheduler-client.service';

class SubmitReportsBulk {
    orcid_id: string;
    delete_all: string[];

}

@Controller({
    path: 'scheduler',
    version: '2'
})
export class SchedulerController {

    constructor(private schedulerService: SchedulerClientService) {}

    @Get()
    async test_task(){
        return await this.schedulerService.test_task();
    }

    // @Get('submit_reports')
    // @
    // async submit_report(@Query() { orcid_id, delete_all }: SubmitReportsBulk){
    //     return await this.schedulerService.submit_reports({
    //         reports,
    //         orcid_id,
    //         delete_all
    //     })
    // }
}
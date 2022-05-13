import { Controller, Get } from '@nestjs/common';
import { PartnerResourcesService } from './partner-resources.service'
@Controller('')
export class PartnerResourcesController {
    constructor(private partnerResourceService: PartnerResourcesService) {}
    @Get('/resources')
    async get_resources() {
        return await this.partnerResourceService.resources_details();
    }
}

import { Controller, Get } from '@nestjs/common';
import { PartnerResourceSummaryDto } from './dto/partner-resources.dto';
import { PartnerResourcesService } from './partner-resources.service'
@Controller('')
export class PartnerResourcesController {
    constructor(private partnerResourceService: PartnerResourcesService) {}
    @Get('/resources')
    async get_resources(): Promise<PartnerResourceSummaryDto[]> {
        return await this.partnerResourceService.resources_details();
    }
}

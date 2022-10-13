import {
	Controller,
	Get,
	Param,
	Query,
	NotFoundException,
} from '@nestjs/common';
import { StatisticsService } from '../../statistics/statistics.service';
import { PartnerResourceSummaryDto } from '../dto/partner-resources.dto';
import { PartnerResourcesService } from './partner-resources.service';
@Controller({ path: 'partner-resources', version: '2' })
export class PartnerResourcesController {
	constructor(private partnerResourceService: PartnerResourcesService) {}
	// @Get('details')
	// async get_resources(): Promise<PartnerResourceSummaryDto[]> {
	// 	return await this.partnerResourceService.resources_details();
	// }

	@Get()
	async list_resources() {
		return await this.partnerResourceService.get_resources();
	}

	@Get(':resource_id')
	async get_resource_details(
		@Param('resource_id') resource_id,
		@Query('page') page = 1,
		@Query('page_size') page_size = 10,
	) {
		const resource_obj = await this.partnerResourceService.get_resource_details(
			resource_id,
			page,
			page_size,
		);
		if (!resource_obj) {
			throw new NotFoundException('Invalid resource_id');
		}
		const { resource, ...other } = resource_obj;

		return {
			data: {
				...resource,
				...other,
			},
			reports_page: page,
			page_size: page_size,
		};
	}

	@Get([':resource_id', 'statistics'])
	async get_resource_statistics(@Param('resource_id') resource_id: string ){
		return 'hi'
	}
}

@Controller()
export class PartnerResourcesControllerOld {
	constructor(private partnerResourceService: PartnerResourcesService) {}
	@Get(['/stat', '/homepage_statistics'])
	async get_statistics() {
		const resources = await this.partnerResourceService.get_resources();
		const [achievement_count, count_biocurators, contributions_count] =
			await this.partnerResourceService.get_counts();
		return {
			achievement_count,
			count_biocurators,
			contributions_count,
			resources,
		};
	}
}

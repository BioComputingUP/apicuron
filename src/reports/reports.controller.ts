import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { ParseUnsignedIntPipe } from '../global/pipes/unsigned-int-validation.pipe';
import { ReportsService } from './reports.service';

@Controller()
export class ReportsController {
	constructor(private reportService: ReportsService) {}

	@Get('reports/:orcid')
	@Roles('admin')
	@UseGuards(LocalAuthGuard, RoleGuard)
	async get_user_reports(@Param('orcid') orcid: string) {
		return await this.reportService.getUserReports(orcid);
	}

	@Get('reports')
	async get_reports(@Param() params) {
		return await this.reportService.get_reports(params);
	}
}
@Controller({ path: 'reports', version: '2' })
export class ReportsControllerV2 {
	constructor(private reportService: ReportsService) {}

	@Get()
	async get_reports(
		@Query('orcid_id') orcid_id: string,
		@Query('resource_id') resource_id: string,
		@Query('page_size', ParseUnsignedIntPipe) page_size: number,
		@Query('page', ParseUnsignedIntPipe) page: number,
	) {
		return this.reportService.getReports(
			orcid_id,
			resource_id,
			page_size,
			page,
		);
	}

	@Get(':orcid_id/:resource_id')
	async get_user_reports(
		@Param('orcid_id') orcid_id: string,
		@Param('resource_id') resource_id: string,
		@Query('page', ParseUnsignedIntPipe) page = 1,
		@Query('page_size', ParseUnsignedIntPipe) page_size = 10,
	) {
		return await this.reportService.get_user_reports(orcid_id, resource_id, page, page_size);
	}
}

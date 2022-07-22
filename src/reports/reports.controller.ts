import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RoleGuard } from 'src/auth/guards/role.guard';
import { ReportsService } from './reports.service';

@Controller('')
export class ReportsController {
	constructor(private reportService: ReportsService) {}

	@Get('/reports/:orcid')
	@Roles('admin')
	@UseGuards(RoleGuard)
	async get_user_reports(@Param('orcid') orcid: string) {
		return await this.reportService.getUserReports(orcid);
	}

	@Get('/reports')
	async get_reports(@Param() params){
		
		return await this.reportService.get_reports(params);
	}

	// @Post('/submit_activity')
	// @UseGuards()
}

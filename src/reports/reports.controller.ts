import {
	Request,
	Controller,
	Post,
	Get,
	Body,
	Param,
	Query,
	UseInterceptors,
	UseGuards,
	UploadedFile,
	Logger,
	ForbiddenException,
	InternalServerErrorException,
	Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBearerAuth,
	ApiConsumes,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';

import { createReadStream } from 'fs';
import { SchedulerClientService } from '../scheduler-client/services/scheduler-client.service';
import { HasAResourceGuard } from '../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { VersionHeader } from '../swagger/config';
import { ParseUnsignedIntPipe } from '../shared/pipes/unsigned-int-validation.pipe';
import { ReportDto } from './dto/report.dto';
import { SubmitBulkDto, SubmitReportDto } from './dto/submit-report.dto';
import { ReportsService } from './reports.service';
import { ComputeStatisticsTask } from '../reports/tasks/compute_statistics.task';
import { ReportFilterDto, ReportFilterGroupedDto } from './dto/report-filter.dto';
import * as _ from 'lodash';
import { plainToClass, plainToInstance } from 'class-transformer';

@ApiTags('Reports')
@ApiHeader(VersionHeader)
@Controller({ path: 'reports', version: '2' })
export class ReportsController {
	constructor(
		private reportService: ReportsService,
		private schedulerService: SchedulerClientService,
		@Inject('task:compute_statistics')
		private computeStatistics: ComputeStatisticsTask,
		private config: ConfigService,
	) {}

	logger = new Logger(ReportsController.name);

	private can_edit_resource(user, resource_id) {
		// get the resources list that belong to the current user
		const user_resources: Array<{ resource_id: string }> = user.resources;
		// check if the resource belongs to the user
		const resource_found = user_resources.find(
			(resource) => resource.resource_id == resource_id,
		);
		// if it doesn't, we respond with  a 403 exception
		if (!resource_found) {
			throw new ForbiddenException(
				`You either do not have the authorization to update the terms of the (${resource_id}) resource or the resource does not exist`,
			);
		}
	}

	// @Get('statistics')
	// async report_statistics(@Query() reportFilter: ReportFilterDto){
	// 	const { filter, options } = this.reportService.buildReportsQuery(reportFilter)
	// 	return await this.reportService.group_reports_by_date(filter, options)
	// }

	@Get()
	async get_reports(@Query() reportFilter: ReportFilterDto, @Request() req) {
		
		const reportFilterInstance: ReportFilterDto = plainToInstance(ReportFilterDto, reportFilter)
		return await this.reportService.getReports(reportFilterInstance);

		// if(!reportFilterInstance.groupBy){
		// }else{
		// }
	}

	@Get('group-by/:groupBy')
	async getGroupedReports(@Query()  filter: ReportFilterDto, @Param() groupBy: Pick<ReportFilterGroupedDto, 'groupBy'>){
		// const filterInstance: ReportFilterDto = plainToInstance(ReportFilterDto, filter);
		const groupByInstance: ReportFilterGroupedDto = plainToInstance(ReportFilterGroupedDto, {...filter, ...groupBy})

		return await this.reportService.getGroupedReports(groupByInstance)
	}

	// @Get('resource/:resource_id/orcid_id/:orcid_id')
	// async get_user_reports(
	// 	@Param('orcid_id') orcid_id: string,
	// 	@Param('resource_id') resource_id: string,
	// 	@Query('page', ParseUnsignedIntPipe) page = 1,
	// 	@Query('page_size', ParseUnsignedIntPipe) page_size = 10,
	// ) {
	// 	const reportFilter = new ReportFilterDto();
	// 	_.assign(reportFilter, {
	// 		curator_orcid: orcid_id,
	// 		resource_id,
	// 		page,
	// 		page_size,
	// 	});
	// 	return await this.reportService.getReports(reportFilter);
	// }

	@ApiOperation({
		summary: 'Submit reports in bulk as a JSON file',
	})
	@ApiOkResponse({
		description: 'Return message confirming the reception of the reports',
	})
	// @ApiHeader({
	// 	name:'authorization',
	// 	description: 'another one'
	// })
	@ApiSecurity('basic')
	@ApiConsumes('multipart/form-data')
	@Post('bulk')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	@UseInterceptors(
		FileInterceptor('reports', {
			dest: '/tmp/apicuron/reports/',
		}),
	)
	async submit_reports(
		@UploadedFile() reports: Express.Multer.File,
		@Request() req,
		@Body() body: SubmitBulkDto,
	) {
			
		const response = await this.schedulerService.submit_reports(reports, req.user.orcid_id, body.delete_all || [])

		if(response instanceof Error){
			throw new InternalServerErrorException('An Error has occured when submitting the reports')
		}

		return {
			status:
				'reports submitted successfully. You will receive a notification containing the submission report',
		};
	}

	@ApiOperation({
		summary: 'Submit a single report',
	})
	@ApiOkResponse({
		description: 'Confirmation Object of the created report',
		type: ReportDto,
	})
	@ApiSecurity('basic')
	@Post('single')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async submit_report(@Body() report: SubmitReportDto, @Request() req) {
		this.can_edit_resource(req.user, report.resource_id);

		// const resource_uri = await this.partnerResourceService.retrieve_uri(report.resource_id)
		const report_confirmation = await this.reportService.insertReport(report);

		await this.computeStatistics.run_task({
			arguments: [ report.resource_id, report.curator_orcid]
		});
		await this.schedulerService.compute_achievements(report.resource_id, report.curator_orcid);
		await this.schedulerService.compute_statistics(report.resource_id, report.curator_orcid);
		return report_confirmation;
	}
}

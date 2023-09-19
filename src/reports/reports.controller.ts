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
	BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBearerAuth,
	ApiConsumes,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';

import { SchedulerClientService } from '../scheduler-client/services/scheduler-client.service';
import { HasAResourceGuard } from '../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { VersionHeader } from '../swagger/config';
import { ReportDto } from './dto/report.dto';
import { SubmitBulkDto, SubmitReportDto } from './dto/submit-report.dto';
import { ReportsService } from './reports.service';
import {
	ReportFilterDto,
	ReportFilterGroupedDto,
} from './dto/report-filter.dto';
import * as _ from 'lodash';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import {
	Statistics,
	StatisticsDocument,
} from '../core/schemas/statistics.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';

@ApiTags('Reports')
@ApiHeader(VersionHeader)
@Controller({ path: 'reports', version: '2' })
export class ReportsController {
	constructor(
		private reportService: ReportsService,
		private schedulerService: SchedulerClientService,
		@InjectModel(Statistics.name) private statModel: Model<StatisticsDocument>,
		private resourceService: PartnerResourcesService
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

	@Get()
	async get_reports(@Query() reportFilter: ReportFilterDto, @Request() req) {
		const reportFilterInstance: ReportFilterDto = plainToInstance(
			ReportFilterDto,
			reportFilter,
		);
		return await this.reportService.getReports(reportFilterInstance);
	}

	@Get('group-by/:groupBy')
	async getGroupedReports(
		@Query() filter: ReportFilterDto,
		@Param() groupBy: Pick<ReportFilterGroupedDto, 'groupBy'>,
	) {
		// const filterInstance: ReportFilterDto = plainToInstance(ReportFilterDto, filter);
		const groupByInstance: ReportFilterGroupedDto = plainToInstance(
			ReportFilterGroupedDto,
			{ ...filter, ...groupBy },
		);

		return await this.reportService.getGroupedReports(groupByInstance);
	}


	

	@ApiOperation({
		summary: 'Submit reports in bulk as a JSON file',
	})
	@ApiOkResponse({
		description: 'Return message confirming the reception of the reports',
	})
	@ApiQuery({
		description: 'A list of Resource Ids where the database manager specifies which resources he wishes to delete all the previous reports (effectively resubmitting everything through this bulk update)',
		name: 'delete-all',
		type: 'string',
		isArray: true,
		example: ['disprot'],
		required: false
	})
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
		@Query('delete-all') deleteAll: string[] | string,
	) {
		let delete_all = [];
		const deleteAllInput = deleteAll ?? body.delete_all;
		if (typeof deleteAllInput == 'string') {
			delete_all = [deleteAllInput];
		} else {
			if (_.isArray(deleteAllInput)) {
				delete_all = deleteAllInput;
			}
		}

		// handle if a resource_id that is passed does not exist
		const existsPromises = delete_all.map((res_id) => this.resourceService.exists(res_id))
		const exists = await Promise.all(existsPromises)
		const i = exists.findIndex((v) => !v)
		if(i != -1){
			throw new BadRequestException(`Resource id ${delete_all[i]} does not exist !`)
		}


		const response = await this.schedulerService.submit_reports(
			reports,
			req.user.orcid_id,
			delete_all || [],
		);

		if (response instanceof Error) {
			throw new InternalServerErrorException(
				'An Error has occured when submitting the reports',
			);
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

		await this.schedulerService.compute_achievements(
			report.resource_id,
			report.curator_orcid,
		);
		await this.schedulerService.compute_statistics(
			report.resource_id,
			report.curator_orcid,
		);
		return report_confirmation;
	}
}

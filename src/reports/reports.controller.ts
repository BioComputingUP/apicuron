import { HttpService } from '@nestjs/axios';
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
	InternalServerErrorException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { createReadStream } from 'fs';
import { SchedulerClientService } from '../scheduler-client/services/scheduler-client.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { HasAResourceGuard } from '../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { AuthorizationHeader, VersionHeader } from '../config/swagger';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { ParseUnsignedIntPipe } from '../shared/pipes/unsigned-int-validation.pipe';
import { ReportDto } from './dto/report.dto';
import { SubmitBulkDto, SubmitReportDto } from './dto/submit-report.dto';
import { ReportsService } from './reports.service';

@ApiTags('First Version')
@Controller('reports')
export class ReportsController {
	constructor(private reportService: ReportsService) {}

	@Get(':orcid')
	@Roles('admin')
	@UseGuards(LocalAuthGuard, RoleGuard)
	async get_user_reports(@Param('orcid') orcid: string) {
		return await this.reportService.getUserReports(orcid);
	}

	@Get('')
	async get_reports(@Param() params) {
		return await this.reportService.get_reports(params);Request
	}
}

@ApiTags('Reports')
@ApiHeader(VersionHeader)
@Controller({ path: 'reports', version: '2' })
export class ReportsControllerV2 {
	constructor(
		private reportService: ReportsService,
		private partnerResourceService: PartnerResourcesService,
		private httpService: HttpService,
		private schedulerService: SchedulerClientService,
		private config:ConfigService) {}

	logger = new Logger(ReportsControllerV2.name)

	private can_edit_resource(user, resource_id){
        // get the resources list that belong to the current user
        const user_resources: Array<{ resource_id: string}> = user.resources
        // check if the resource belongs to the user
        const resource_found = user_resources.find(resource => resource.resource_id == resource_id)
        // if it doesn't, we respond with  a 403 exception
        if(!resource_found){
            throw new ForbiddenException(`You either do not have the authorization to update the terms of the (${resource_id}) resource or the resource does not exist`);
        }
    }

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
		return await this.reportService.get_user_reports(
			orcid_id,
			resource_id,
			page,
			page_size,
		);
	}

	@ApiOperation({
        summary: 'Submit reports in bulk as a JSON file'
    })
    @ApiOkResponse({
        description: 'Return message confirming the reception of the reports',
    })
	@ApiHeader(AuthorizationHeader)
	@ApiConsumes('multipart/form-data')
	@Post('bulk')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	@UseInterceptors(FileInterceptor('reports', {
		dest: '/tmp/apicuron/reports/'
	}))
	async submit_reports(@UploadedFile() reports: Express.Multer.File, @Request() req, @Body() body: SubmitBulkDto) {

		// importing the formData package
		var FormData = require("form-data")

		// getting environment variables to configure the job parameters
		const database_host = this.config.get<string>('db_host')
		const database = this.config.get<string>('database')

		const formData = new FormData();

		// append multiple field values to the formData
		formData.append('task_name', 'apicuron_tasks')
		formData.append('database_host', database_host)
		formData.append('task', 'submit_report')
		formData.append('database', database)
		
		// if the delete_all exists we add it to the arguments otherwise we only send the orcid
		if(body.delete_all){
			formData.append('task_arguments', `${req.user.orcid_id} ${body.delete_all.join(',')}`)
		}else{
			formData.append('task_arguments', req.user.orcid_id)
		}
		
		// append a file to the formData
		formData.append('task_file_argument', createReadStream(reports.path), {
			filename: reports.originalname,
			contentType: reports.mimetype,
			knownLength: reports.size
		})

		// send the request
		formData.submit('https://scheduler.biocomputingup.it/task/', (err, res) => {
			if(err){
				this.logger.error('An error occurred after submitting a job to the biocomp scheduler')
				this.logger.error(err)

				throw new InternalServerErrorException('An internal error occured.')
			}
		})

		
		if(body.delete_all){
			body.delete_all.forEach(async (resource_id) => {
				await this.schedulerService.compute_achievements(resource_id)
				this.schedulerService.compute_statistics(resource_id)
			})
		}

		return { status: 'reports submitted successfully. You will receive a notification containing the submission report'}

	}

	@ApiOperation({
        summary: 'Submit a single report'
    })
    @ApiOkResponse({
        description: 'Confirmation Object of the created report',
		type: ReportDto
    })
	@ApiHeader(AuthorizationHeader)
	@Post('single')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async submit_report(@Body() report: SubmitReportDto, @Request() req) {
		this.can_edit_resource(req.user, report.resource_id);

		// const resource_uri = await this.partnerResourceService.retrieve_uri(report.resource_id)
		const report_confirmation = await this.reportService.insertReport(report);
		await this.schedulerService.compute_achievements(report.resource_id, report.curator_orcid);
		await this.schedulerService.compute_statistics(report.resource_id, report.curator_orcid);
		return report_confirmation;
	}
}

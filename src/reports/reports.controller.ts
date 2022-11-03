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
	InternalServerErrorException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { Blob } from 'buffer';
import { createReadStream } from 'fs';
import { tap } from 'rxjs';
import { Readable } from 'stream';
import { Roles } from '../auth/decorators/roles.decorator';
import { HasAResourceGuard } from '../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { ParseUnsignedIntPipe } from '../shared/pipes/unsigned-int-validation.pipe';
import { ReportDto } from './dto/report.dto';
import { SubmitReportDto } from './dto/submit-report.dto';
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
@Controller({ path: 'reports', version: '2' })
export class ReportsControllerV2 {
	constructor(private reportService: ReportsService, private httpService: HttpService, private config:ConfigService) {}

	logger = new Logger(ReportsControllerV2.name)

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

	@Post('')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	@UseInterceptors(FileInterceptor('reports', {
		dest: '/tmp/apicuron/reports/'
	}))
	async submit_reports(@UploadedFile() reports: Express.Multer.File, @Request() req, @Body("delete-all") delete_all: Array<string> | undefined) {

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
		if(delete_all){
			formData.append('task_arguments', `${req.user.orcid_id} ${delete_all.join(',')}`)
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

		return { status: 'reports submitted successfully. You will receive a notification containing the submission report'}

	}


	@Post('single')
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async submit_report(@Body() report: SubmitReportDto) {
		return report;
	}
}

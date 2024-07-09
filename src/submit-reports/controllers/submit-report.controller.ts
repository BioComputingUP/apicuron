import {
	Body,
	Controller,
	Post,
	Res,
	UseGuards,
	Request,
	ForbiddenException,
	UseInterceptors,
	BadRequestException,
	InternalServerErrorException,
	Query,
	UploadedFile,
} from '@nestjs/common';
import {
	ApiOperation,
	ApiOkResponse,
	ApiSecurity,
	ApiHeader,
	ApiTags,
	ApiConsumes,
	ApiQuery,
} from '@nestjs/swagger';
import { HasAResourceGuard } from '../../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { ReportDto } from '../../reports/dto/report.dto';
import {
	SubmitBulkDto,
	SubmitReportDto,
	SubmitReportsDto,
} from '../dto/submit-report.dto';
import { SubmitReportService } from '../services/submit-reports.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { VersionHeader } from '../../swagger/config';
import { FileInterceptor } from '@nestjs/platform-express';
import _ from 'lodash';
import { SchedulerClientService } from '../../scheduler-client/services/scheduler-client.service';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import {
	IManyReportsSubmittedEventPayload,
	IReportSubmittedEventPayload,
	ManyReportsSubmittedEvent,
	ReportSubmittedEvent,
} from '../events/events';
import { isArray } from 'lodash';
@ApiTags('Reports')
@ApiHeader(VersionHeader)
@Controller({ path: 'reports', version: '2' })
export class SubmitReportsController {
	constructor(
		protected reportService: SubmitReportService,
		protected eventEmitter: EventEmitter2,
		private schedulerClientService: SchedulerClientService,
		private resourceService: PartnerResourcesService,
	) {}

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
				`You either do not have the authorization to perform CRUD operation on the reports of the (${resource_id}) resource or the resource does not exist`,
			);
		}
	}

	@ApiOperation({
		summary: 'Submit reports in bulk as a JSON file',
	})
	@ApiOkResponse({
		description: 'Return message confirming the reception of the reports',
	})
	@ApiQuery({
		description:
			'A list of Resource Ids where the database manager specifies which resources he wishes to delete all the previous reports (effectively resubmitting everything through this bulk update)',
		name: 'delete-all',
		type: 'string',
		isArray: true,
		example: ['disprot'],
		required: false,
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
			if (isArray(deleteAllInput)) {
				delete_all = deleteAllInput;
			}
		}

		// handle if a resource_id that is passed does not exist
		const existsPromises = delete_all.map((res_id) =>
			this.resourceService.exists(res_id),
		);
		const exists = await Promise.all(existsPromises);
		const i = exists.findIndex((v) => !v);
		if (i != -1) {
			throw new BadRequestException(
				`Resource id ${delete_all[i]} does not exist !`,
			);
		}

		const response = await this.schedulerClientService.submit_reports(
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
	async submit_report(
		@Body() report: SubmitReportDto,
		@Request() req,
		@Res() res,
	) {
		this.can_edit_resource(req.user, report.resource_id);

		const report_confirmation = await this.reportService.insertReport(report, {
			preventEvents: true,
		});

		res.send(report_confirmation);

		await this.eventEmitter.emitAsync(ReportSubmittedEvent, {
			report: report_confirmation,
		} as IReportSubmittedEventPayload);
	}

	@ApiOperation({
		summary: 'Submit a JSON array of reports',
	})
	@ApiOkResponse({
		description: 'Confirmation Object of the created reports',
	})
	@ApiSecurity('basic')
	@Post()
	@UseGuards(LocalAuthGuard, HasAResourceGuard)
	async post_reports(
		@Body() reportSubmission: SubmitReportsDto,
		@Request() req,
		@Res() res: Response,
	) {
		const resourcesConcerned = await reportSubmission.reports.reduce(
			(prev, curr) => {
				if (!prev.includes(curr.resource_id)) {
					prev.push(curr.resource_id);
				}
				return prev;
			},
			[],
		);
		resourcesConcerned.map((res_id: string) =>
			this.can_edit_resource(req.user, res_id),
		);

		const response = { deletedReports: null, insertedCount: 0 };

		if (reportSubmission.delete_all) {
			response.deletedReports =
				await this.reportService.deleteAllResourcesReports(
					reportSubmission.delete_all,
				);
		}

		const { insertedCount, reports } = await this.reportService.insertReports(
			reportSubmission.reports,
			{ preventEvents: true },
		);
		response.insertedCount = insertedCount;

		// send the insertion response
		res.send(response);

		await this.eventEmitter.emitAsync(ManyReportsSubmittedEvent, {
			reports,
		} as IManyReportsSubmittedEventPayload);

		return;
	}
}

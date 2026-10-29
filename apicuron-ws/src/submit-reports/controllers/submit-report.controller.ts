import {
	BadRequestException,
	Body,
	Controller,
	ForbiddenException,
	InternalServerErrorException,
	Logger,
	Post,
	Query,
	Request,
	Res,
	UploadedFile,
	UseFilters,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiConsumes,
	ApiHeader,
	ApiOkResponse,
	ApiOperation,
	ApiQuery,
	ApiSecurity,
	ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { isArray, uniq } from 'lodash';
import {
	SubmitBulkTask,
	SubmitBulkTaskArgs,
} from 'src/scheduler/tasks/submit_bulk.task';
import { AuthProtected } from '../../auth/decorators/auth.decorator';
import { HasAResourceGuard } from '../../auth/guards/belongs-to-resource.guard';
import { LocalAuthGuard } from '../../auth/guards/local-auth.guard';
import { VersionHeader } from '../../plugins/swagger/config';
import { ReportDto } from '../../reports/dto/report.dto';
import { PartnerResourcesService } from '../../resources/partner-resources/services/partner-resources.service';
import {
	SubmitBulkDto,
	SubmitReportDto,
	SubmitReportsDto,
} from '../dto/submit-report.dto';
import { SubmissionLoggingFilter } from '../filters/submission-logging.filter';
import { SubmitReportService } from '../services/submit-reports.service';
@ApiTags('Reports')
@ApiHeader(VersionHeader)
@Controller({ path: 'reports', version: '2' })
@UseFilters(SubmissionLoggingFilter)
export class SubmitReportsController {
	constructor(
		protected reportService: SubmitReportService,
		private resourceService: PartnerResourcesService,
		private submitBulkTask: SubmitBulkTask,
	) {}

	private readonly logger = new Logger(SubmitReportsController.name);

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
	@ApiConsumes('multipart/form-data')
	@AuthProtected()
	@Post('bulk')
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
		@Res() res: Response,
	) {
		let delete_all: string[] = [];
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

		const command: SubmitBulkTaskArgs = {
			file: reports.path,
			orcid_id: req.user.orcid_id,
			delete_existing: delete_all,
		};

		const response = this.submitBulkTask.run([], command);
		// .submit_reports(
		// 	reports,
		// 	req.user.orcid_id,
		// 	delete_all || [],
		// );

		if (response instanceof Error) {
			throw new InternalServerErrorException(
				'An Error has occured when submitting the reports',
			);
		}

		res.send({
			status:
				'reports submitted successfully. You will receive a notification containing the submission report',
		});
		await response;

		return;
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

		const { report: report_confirmation, callback } =
			await this.reportService.insertReport(report, {
				preventEvents: true,
			});

		res.send(report_confirmation);

		await callback();
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
		const user = req.user as {
			orcid_id: string;
			resources?: { resource_id: string }[];
		};
		const submitter = user.orcid_id;
		const submittedCount = reportSubmission.reports.length;
		const resource_ids = uniq(
			reportSubmission.reports.map((report) => report.resource_id),
		);
		const delete_all = reportSubmission.delete_all ?? [];
		const resources = `resource(s) [${resource_ids.join(', ')}]`;
		const deletion =
			delete_all.length > 0
				? `, deleting all previous reports of [${delete_all.join(', ')}]`
				: '';
		this.logger.verbose(
			`Received ${submittedCount} report(s) from ${submitter} for ${resources}${deletion}`,
		);

		// the user has to manage every resource it submits to or deletes from
		const user_resources = (user.resources ?? []).map(
			(resource) => resource.resource_id,
		);
		const forbidden = uniq([...resource_ids, ...delete_all]).filter(
			(resource_id) => !user_resources.includes(resource_id),
		);
		if (forbidden.length > 0) {
			throw new ForbiddenException(
				`You either do not have the authorization to perform CRUD operation on the reports of the resource(s) (${forbidden.join(
					', ',
				)}) or they do not exist`,
			);
		}

		const { insertedCount, deletedReports, callback } =
			await this.reportService.insertReports(reportSubmission, {
				preventEvents: true,
			});
		const response = {
			message: `Successfully submitted ${insertedCount} of ${submittedCount} report(s)`,
			submittedCount,
			insertedCount: insertedCount,
			resource_ids,
			deletedReports: deletedReports,
		};
		const deleted = Object.entries(deletedReports)
			.map(
				([resource_id, result]) =>
					`, deleted ${
						result?.deletedCount ?? 0
					} previous report(s) of ${resource_id}`,
			)
			.join('');
		this.logger.verbose(
			`Inserted ${insertedCount}/${submittedCount} report(s) from ${submitter} for ${resources}${deleted}`,
		);

		// send the insertion response
		res.send(response);

		await callback();

		return;
	}
}

import {
	BadRequestException,
	Body,
	Controller,
	InternalServerErrorException,
	Logger,
	Post,
	Query,
	Request,
	Res,
	UploadedFile,
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
import { SubmitReportService } from '../services/submit-reports.service';
import { assertUserManagesResource } from 'src/util/authrization.helpers';
@ApiTags('Reports')
@ApiHeader(VersionHeader)
@Controller({ path: 'reports', version: '2' })
export class SubmitReportsController {
	constructor(
		protected reportService: SubmitReportService,
		private resourceService: PartnerResourcesService,
		private submitBulkTask: SubmitBulkTask,
	) {}

	private readonly logger = new Logger(SubmitReportsController.name);

	private can_edit_resource(user, resource_id) {
		assertUserManagesResource(user, resource_id);
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
	@ApiSecurity('basic')
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

		// the user has to manage every resource it deletes from
		assertUserManagesResource(req.user, delete_all);

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
		assertUserManagesResource(user, [...resource_ids, ...delete_all]);

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

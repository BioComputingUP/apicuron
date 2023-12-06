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
	Inject,
	Res,
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
import {
	SubmitBulkDto,
	SubmitReportDto,
	SubmitReportsDto,
} from './dto/submit-report.dto';
import { ReportsService } from './reports.service';
import {
	ReportFilterDto,
	ReportFilterGroupedDto,
} from './dto/report-filter.dto';
import * as _ from 'lodash';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
// import {
// 	Statistics,
// 	StatisticsDocument,
// } from '../core/schemas/statistics.schema';
import { InjectModel } from '@nestjs/mongoose';
import { PartnerResourcesService } from '../resources/partner-resources/partner-resources.service';
import { Report, ReportDocument } from '../core/schemas/reports.schema';
import { Response } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
	COMPUTE_CURATOR_STATISTICS_TASK,
	COMPUTE_RESOURCE_ACHIEVEMENTS_TASK,
	COMPUTE_RESOURCE_STATISTICS_TASK,
	COMPUTE_USER_BADGES_TASK,
} from '../scheduler/contants';
import { UserReq } from '../auth/decorators/applyUser.decorator';
import { User } from '../core/schemas/user.schema';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Reports')
@ApiHeader(VersionHeader)
@Controller({ path: 'reports', version: '2' })
export class ReportsController {
	constructor(
		private reportService: ReportsService,
		private eventEmitter: EventEmitter2,
		private schedulerClientService: SchedulerClientService,
		@InjectModel(Report.name) private reportModel: Model<ReportDocument>,
		private resourceService: PartnerResourcesService,
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
				`You either do not have the authorization to perform CRUD operation on the reports of the (${resource_id}) resource or the resource does not exist`,
			);
		}
	}
	@UseGuards(LocalAuthGuard)
	@Public()
	@Get()
	async get_reports(
		@Query() reportFilter: ReportFilterDto,
		@UserReq() user: User,
	) {
		// TODO: Add resource ownership control and add it to allowed resources when querying reports
		const reportFilterInstance: ReportFilterDto = plainToInstance(
			ReportFilterDto,
			reportFilter,
		);
		const allowedResources =
			user?.resources.map(({ resource_id }) => resource_id) ?? [];
		return await this.reportService.getReports(
			reportFilterInstance,
			user?.orcid_id,
			allowedResources,
		);
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
			if (_.isArray(deleteAllInput)) {
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
	async submit_report(@Body() report: SubmitReportDto, @Request() req) {
		this.can_edit_resource(req.user, report.resource_id);

		// const resource_uri = await this.partnerResourceService.retrieve_uri(report.resource_id)
		const report_confirmation = await this.reportService.insertReport(report);

		const resource = await this.resourceService.get_resource(
			report_confirmation.resource_id,
		);

		// TODO: Add Event listener on the statistics and achievements module and Remove these function calls

		this.logger.verbose(`Computing Badges for user "${report.curator_orcid}"`);
		await this.eventEmitter.emitAsync(COMPUTE_USER_BADGES_TASK, {
			resource,
			user: { orcid_id: report.curator_orcid },
		});

		this.logger.verbose(`Computing Stats for user "${report.curator_orcid}"`);
		await this.eventEmitter.emitAsync(COMPUTE_CURATOR_STATISTICS_TASK, {
			resource,
			user: { orcid_id: report.curator_orcid },
		});
		return report_confirmation;
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

		const { insertedCount } = await this.reportService.insertReports(
			reportSubmission.reports,
		);
		response.insertedCount = insertedCount;

		// send the insertion response
		res.send(response);

		// start computing the scores and achievements after
		const computePromises$ = resourcesConcerned.map(
			async (resource_id: string) => {
				await this.eventEmitter.emitAsync(COMPUTE_RESOURCE_ACHIEVEMENTS_TASK, {
					resource_id,
				});
				return await this.eventEmitter.emitAsync(
					COMPUTE_RESOURCE_STATISTICS_TASK,
					{ resource_id },
				);
			},
		);

		await Promise.all(computePromises$);

		return;
	}
}

import {
	Controller,
	Get,
	Param,
	Query,
	UseGuards,
	Logger,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { VersionHeader } from '../swagger/config';
import { ReportsService } from './reports.service';
import {
	ReportFilterDto,
	ReportFilterGroupedDto,
} from './dto/report-filter.dto';
import { plainToInstance } from 'class-transformer';
import { UserReq } from '../auth/decorators/applyUser.decorator';
import { User } from '../core/schemas/user.schema';
import { Public } from '../auth/decorators/public.decorator';
import { userResourceEntityPrivacyFilter } from '../util/privacy.helper';

@ApiTags('Reports')
@ApiHeader(VersionHeader)
@Controller({ path: 'reports', version: '2' })
export class ReportsController {
	constructor(private reportService: ReportsService) {}

	logger = new Logger(ReportsController.name);

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
		// const allowedResources =
		// 	user?.resources.map(({ resource_id }) => resource_id) ?? [];

		const privacyFilter = userResourceEntityPrivacyFilter(user);

		return await this.reportService.getReports(
			reportFilterInstance,
			privacyFilter,
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
}

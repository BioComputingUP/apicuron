import {
	Controller,
	Get,
	Param,
	Query,
	UseGuards,
	Logger,
	SerializeOptions,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

import { LocalAuthGuard } from '../auth/guards/local-auth.guard';
import { VersionHeader } from '../plugins/swagger/config';
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
import { AuthProtected } from '../auth/decorators/auth.decorator';
import { ApiResponsePaginated } from '../pagination/decorators/paginated-reponse.decorator';
import { ReportWithTermDto } from './dto/report.dto';
import { Paginated } from 'src/pagination/paginator';

@ApiTags('Reports')
@ApiHeader(VersionHeader)
@Controller({ path: 'reports', version: '2' })
export class ReportsController {
	constructor(private reportService: ReportsService) { }

	logger = new Logger(ReportsController.name);

	@ApiResponsePaginated(
		ReportWithTermDto,
		200,
		'List of reports matching filter',
	)
	@AuthProtected()
	@SerializeOptions({ type: Paginated<ReportWithTermDto> })
	@Public()
	@Get()
	async getReports(
		@Query() reportFilter: ReportFilterDto,
		@UserReq() user: User,
	) {
		const reportFilterInstance: ReportFilterDto = plainToInstance(
			ReportFilterDto,
			reportFilter,
		);

		const privacyFilter = userResourceEntityPrivacyFilter(user);

		return await this.reportService.getReports(
			reportFilterInstance,
			privacyFilter,
		);
	}

}

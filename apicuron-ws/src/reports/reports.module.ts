import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ResourcesModule } from '../resources/resources.module';
import { HttpModule } from '@nestjs/axios';
import { TermsModule } from '../terms/terms.module';
import { CoreApicuronModule } from '../core/core.module';
import { ReportEventsHandlerService } from './services/event-handler.service';
import { ReportAggregatorService } from './services/report-aggregator.service';

@Module({
	controllers: [ReportsController],
	providers: [
		ReportsService,
		ReportEventsHandlerService,
		ReportAggregatorService,
	],
	imports: [
		HttpModule,
		CoreApicuronModule,
		AuthModule,
		ResourcesModule,
		TermsModule,
	],
	exports: [ReportsService],
})
export class ReportsModule {}

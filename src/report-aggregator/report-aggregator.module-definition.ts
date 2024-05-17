import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ReportAggregatorModuleOptions } from './interfaces/report-aggregator-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
	new ConfigurableModuleBuilder<ReportAggregatorModuleOptions>().build();

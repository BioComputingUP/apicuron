import { Module } from '@nestjs/common';
import { CoreApicuronModule } from '../core/core.module';

@Module({
	imports: [CoreApicuronModule],
	controllers: [],
	providers: [],
	exports: [],
})
export class ComputeStatisticsModule {}

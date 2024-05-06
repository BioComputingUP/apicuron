import { Module } from '@nestjs/common';
import { StatisticsDetailsService } from './statistics-details.service';
import { StatisticsDetailsController } from './statistics-details.controller';
import { CoreApicuronModule } from '../core/core.module';

@Module({
	imports: [CoreApicuronModule],
	providers: [StatisticsDetailsService],
	controllers: [StatisticsDetailsController],
})
export class StatisticsDetailsModule {}

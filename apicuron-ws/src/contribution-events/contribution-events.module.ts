import { Module } from '@nestjs/common';
import { CoreApicuronModule } from 'src/core/core.module';

@Module({
	imports: [CoreApicuronModule],
	providers: [],
	controllers: [],
})
export class ContributionEventsModule {}

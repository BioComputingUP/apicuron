import { Module } from '@nestjs/common';
import { CoreApicuronModule } from 'src/core/core.module';
import { ContributionEventsRepository } from './repository/contribution-events.repository';

@Module({
	imports: [CoreApicuronModule],
	providers: [ContributionEventsRepository],
	exports: [ContributionEventsRepository],
})
export class ContributionEventsModule {}

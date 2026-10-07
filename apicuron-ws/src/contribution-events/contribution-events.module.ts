import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { CoreApicuronModule } from 'src/core/core.module';
import { TrackerEventsController } from './contribution-events.controller';
import { ContributionEventsRepository } from './repository/contribution-events.repository';
import { ResourceSourceRepository } from './repository/resource-source.repository';
import { TrackerEventsIngestService } from './services/tracker-events-ingest.service';

@Module({
	imports: [CoreApicuronModule, JwtModule, AuthModule],
	providers: [
		ContributionEventsRepository,
		TrackerEventsIngestService,
		ResourceSourceRepository,
	],
	exports: [ContributionEventsRepository],
	controllers: [TrackerEventsController],
})
export class ContributionEventsModule {}

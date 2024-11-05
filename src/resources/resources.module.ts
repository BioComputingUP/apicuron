import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PartnerResourcesController } from './partner-resources/controllers/partner-resources.controller';
import { PartnerResourcesService } from './partner-resources/services/partner-resources.service';
import { SubmittedResourcesController } from './submitted-resources/resources.controller';
import { SubmittedResourcesService } from './submitted-resources/resources.service';
import { JwtModule } from '@nestjs/jwt';
import { ResourceIdExists } from './partner-resources/validators/resource-id-exists';
import { CoreApicuronModule } from '../core/core.module';
import { ResourceLeagueController } from './partner-resources/leagues/resource-league.controller';
import { LeagueService } from './partner-resources/leagues/services/league.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
	controllers: [
		PartnerResourcesController,
		SubmittedResourcesController,
		ResourceLeagueController,
	],
	providers: [
		ResourceIdExists,
		PartnerResourcesService,
		LeagueService,
		SubmittedResourcesService,
	],
	exports: [PartnerResourcesService, ResourceIdExists],
	imports: [CoreApicuronModule, EventEmitterModule, AuthModule, JwtModule],
})
export class ResourcesModule {}

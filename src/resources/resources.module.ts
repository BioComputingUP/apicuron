import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { CoreApicuronModule } from '../core/core.module';
import { PartnerResourcesController } from './partner-resources/controllers/partner-resources.controller';
import { ResourceLeagueController } from './partner-resources/leagues/resource-league.controller';
import { LeagueService } from './partner-resources/leagues/services/league.service';
import { PartnerResourcesService } from './partner-resources/services/partner-resources.service';
import { ResourceIdExists } from './partner-resources/validators/resource-id-exists';
import { SubmittedResourcesController } from './submitted-resources/resources.controller';
import { SubmittedResourcesService } from './submitted-resources/resources.service';

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

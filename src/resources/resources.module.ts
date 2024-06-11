import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PartnerResourcesController } from './partner-resources/controllers/partner-resources.controller';
import { PartnerResourcesService } from './partner-resources/services/partner-resources.service';
import { SubmittedResourcesController } from './submitted-resources/resources.controller';
import { SubmittedResourcesService } from './submitted-resources/resources.service';
import { UniqueResourceIdRule } from './validators/unique-resource-id';
import { UniqueResourceURIRule } from './validators/unique-resource-uri';
import { JwtModule } from '@nestjs/jwt';
import { ResourceIdExists } from './partner-resources/validators/resource-id-exists';
import { CoreApicuronModule } from '../core/core.module';
import { ResourceLeagueController } from './partner-resources/leagues/resource-league.controller';

@Module({
	controllers: [
		PartnerResourcesController,
		SubmittedResourcesController,
		ResourceLeagueController,
	],
	providers: [
		UniqueResourceIdRule,
		UniqueResourceURIRule,
		ResourceIdExists,
		PartnerResourcesService,
		SubmittedResourcesService,
	],
	exports: [PartnerResourcesService, ResourceIdExists],
	imports: [CoreApicuronModule, AuthModule, JwtModule],
})
export class ResourcesModule {}

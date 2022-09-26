import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Report, ReportSchema } from '../reports/reports.schema';
import {
	PartnerResourcesController,
	PartnerResourcesControllerOld,
} from './partner-resources/partner-resources.controller';
import { PartnerResourcesService } from './partner-resources/partner-resources.service';
import { SubmittedResourcesController } from './submitted-resources/resources.controller';
import {
	PartnerResourceSchema,
	PartnerResource,
} from './schemas/partner-resources.schema';
import { Term, TermSchema } from './schemas/terms.schema';
import { TermsController } from './terms/terms.controller';
import { SubmittedResourcesService } from './submitted-resources/resources.service';
import { Resource, ResourceSchema } from './schemas/resource.schema';
import {
	SubmittedResource,
	SubmittedResourceSchema,
} from './schemas/submitted-resource.schema';
import { TransformerModule } from '../global/transformer/transformer.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { TermsService } from './terms/terms.service';

@Module({
	controllers: [
		PartnerResourcesController,
		PartnerResourcesControllerOld,
		TermsController,
		SubmittedResourcesController,
	],
	providers: [PartnerResourcesService, SubmittedResourcesService, TermsService],
	exports: [PartnerResourcesService, MongooseModule, TermsService],
	// providers: [ResourcesService],
	imports: [
		AuthModule,
		AchievementsModule,
		MongooseModule.forFeature([
			{
				name: Resource.name,
				schema: ResourceSchema,
				discriminators: [
					{
						name: PartnerResource.name,
						schema: PartnerResourceSchema,
					},
					{
						name: SubmittedResource.name,
						schema: SubmittedResourceSchema,
					},
				],
			},
			{
				name: Term.name,
				schema: TermSchema,
			},
			{
				name: Report.name,
				schema: ReportSchema,
			},
		]),
		TransformerModule,
	],
})
export class ResourcesModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { Report, ReportSchema } from '../reports/reports.schema';
import { PartnerResourcesController } from './partner-resources/partner-resources.controller';
import { PartnerResourcesService } from './partner-resources/partner-resources.service';
import { SubmittedResourcesController } from './submitted-resources/resources.controller';
import {
	PartnerResourceSchema,
	PartnerResource,
} from './schemas/partner-resources.schema';
import { Term, TermSchema } from '../terms/schemas/terms.schema';
import { SubmittedResourcesService } from './submitted-resources/resources.service';
import { Resource, ResourceSchema } from './schemas/resource.schema';
import {
	SubmittedResource,
	SubmittedResourceSchema,
} from './schemas/submitted-resource.schema';
// import { TransformerModule } from '../shared/transformer/transformer.module';
import { UniqueResourceIdRule } from './validators/unique-resource-id';
import { UniqueResourceURIRule } from './validators/unique-resource-uri';
import { JwtModule } from '@nestjs/jwt';
import { ResourceIdExists } from './partner-resources/validators/resource-id-exists';

@Module({
	controllers: [
		PartnerResourcesController,
		SubmittedResourcesController,
	],
	providers: [UniqueResourceIdRule, UniqueResourceURIRule, ResourceIdExists, PartnerResourcesService, SubmittedResourcesService],
	exports: [PartnerResourcesService, MongooseModule, ResourceIdExists],
	imports: [
		AuthModule,
		JwtModule,
		// AchievementsModule,
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
				name: Report.name,
				schema: ReportSchema,
			},
		]),
		// TransformerModule,
	],
})
export class ResourcesModule { }

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PartnerResourcesController } from './partner-resources.controller';
import { PartnerResourcesService } from './partner-resources.service';
import { Achievement, AchievementSchema } from './schemas/achievements.schema';
import { Badge, BadgeSchema } from './schemas/badges.schema';
import { Medal, MedalSchema } from './schemas/medals.schema';
import { PartnerResourceSchema, PartnerResource } from './schemas/partner-resources.schema';
import { Term, TermSchema } from './schemas/terms.schema';
import { TermsController } from './terms/terms.controller';

@Module({
	controllers: [PartnerResourcesController, TermsController],
	providers: [PartnerResourcesService],
	imports: [
		MongooseModule.forFeature([
			{
				name: Achievement.name,
				schema: AchievementSchema,
				discriminators: [
					{ name: 'badge', schema: BadgeSchema },
					{ name: 'medal', schema: MedalSchema },
				],
			},
			{
				name: PartnerResource.name,
				schema: PartnerResourceSchema,
			},
			{
				name: Term.name,
				schema: TermSchema,
			},
		]),
	],
})
export class PartnerResourcesModule {}

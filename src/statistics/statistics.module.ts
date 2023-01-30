import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Statistics, StatisticsSchema } from './schemas/statistics.schema';
import { OldStatisticsController, StatisticsController } from './statistics/statistics.controller';
import { StatisticsService } from './statistics.service';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
// import { TransformerModule } from '../shared/transformer/transformer.module';
import { APP_INTERCEPTOR } from '@nestjs/core'
import { TransformInterceptor } from '../shared/transformer/transform.interceptor';
import { AchievementsModule } from '../achievements/achievements.module';
@Module({
    imports:[
        AuthModule,
        ResourcesModule,
        AchievementsModule,
        MongooseModule.forFeature([
			{
				name: Statistics.name,
				schema: StatisticsSchema,
			}
		]),
        // TransformerModule
    ],
    controllers: [StatisticsController, OldStatisticsController],
    providers: [StatisticsService]
})
export class StatisticsModule {}

import { Module } from '@nestjs/common';
import { OldStatisticsController, StatisticsController } from './statistics/statistics.controller';
import { StatisticsService } from './statistics.service';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { CoreApicuronModule } from '../core/core.module';
@Module({
    imports:[
        CoreApicuronModule,
        AuthModule,
        ResourcesModule,
        AchievementsModule,
        // forwardRef(() => ReportsModule),
        // TransformerModule
    ],
    controllers: [StatisticsController, OldStatisticsController],
    providers: [StatisticsService],
    exports: []
})
export class StatisticsModule {}

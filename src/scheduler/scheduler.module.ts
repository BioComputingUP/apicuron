import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { AchievementsModule } from '../achievements/achievements.module';
import { AuthModule } from '../auth/auth.module';
import { ReportsModule } from '../reports/reports.module';
import { ResourcesModule } from '../resources/resources.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { SchedulerService } from './services/scheduler.service';
// import { ComputeStatisticsTask } from './tasks/compute_statistics.task';

@Module({
  imports: [forwardRef(() => ReportsModule), HttpModule, AuthModule, StatisticsModule, ResourcesModule, AchievementsModule],
  providers: [SchedulerService,
  ],
  exports: [
  ],
  controllers: [],
})
export class SchedulerModule { }

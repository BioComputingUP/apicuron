import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { ReportsModule } from '../reports/reports.module';
import { ReportsParser } from './reports.parser';
import { SchedulerService } from './services/scheduler.service';

@Module({
  imports: [HttpModule, AuthModule, MongooseModule, ReportsModule],
  providers: [SchedulerService, ReportsParser],
  controllers: [],
})
export class SchedulerModule {}

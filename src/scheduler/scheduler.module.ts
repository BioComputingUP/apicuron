import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SchedulerController } from './scheduler.controller';
import { SchedulerClientService } from './services/scheduler-client.service';
import { SchedulerService } from './services/scheduler.service';

@Module({
  imports: [HttpModule],
  providers: [SchedulerClientService, SchedulerService],
  controllers: [],
  exports: [SchedulerClientService]
})
export class SchedulerModule {}

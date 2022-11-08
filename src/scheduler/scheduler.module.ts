import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './services/scheduler.service';

@Module({
  imports: [HttpModule],
  providers: [SchedulerService],
  controllers: [],
  exports: [SchedulerService]
})
export class SchedulerModule {}

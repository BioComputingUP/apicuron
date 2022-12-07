import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SchedulerClientService } from './services/scheduler-client.service';
import { SchedulerService } from './services/scheduler.service';

@Module({
  imports: [HttpModule, AuthModule],
  providers: [SchedulerClientService, SchedulerService],
  controllers: [],
  exports: [SchedulerClientService]
})
export class SchedulerModule {}

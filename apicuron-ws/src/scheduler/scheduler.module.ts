import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SchedulerService } from './services/scheduler.service';
// import { ComputeStatisticsTask } from './tasks/compute_statistics.task';
import { Provider } from '@nestjs/common/interfaces/modules';
@Module({
  imports: [HttpModule, AuthModule],
  providers: [SchedulerService,
  ],
  exports: [
  ],
  controllers: [],
})
export class SchedulerModule {

  // dynamic modules explained here
  // https://dev.to/nestjs/providing-providers-to-dynamic-nestjs-modules-1i6n
  static registerTasks(tasks: Provider[]) {
    return {
      module: SchedulerModule,
      providers: [
        ...tasks,
        HttpModule,
      ],
      exports: [SchedulerService]
    }
  }
}

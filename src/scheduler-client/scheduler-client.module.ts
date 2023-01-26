import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SchedulerClientService } from './services/scheduler-client.service';

@Module({
    imports: [HttpModule, AuthModule],
    providers: [SchedulerClientService],
    exports: [SchedulerClientService]

})
export class SchedulerClientModule {}

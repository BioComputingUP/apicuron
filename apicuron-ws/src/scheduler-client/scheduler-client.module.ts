import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ResourcesModule } from '../resources/resources.module';
import { SchedulerClientService } from './services/scheduler-client.service';

@Module({
    imports: [HttpModule, AuthModule, ResourcesModule],
    providers: [SchedulerClientService],
    exports: [SchedulerClientService]

})
export class SchedulerClientModule {

    // public static register(){
    //     return {
    //         module: SchedulerClientModule,
    //         providers: [SchedulerClientService],
    //         exports:[SchedulerClientService]
    //     }
    // }
}

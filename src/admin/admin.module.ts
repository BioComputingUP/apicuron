import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CoreApicuronModule } from 'src/core/core.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
	imports: [HttpModule, CoreApicuronModule],
	controllers: [AdminController],
	providers: [AdminService],
})
export class AdminModule {}

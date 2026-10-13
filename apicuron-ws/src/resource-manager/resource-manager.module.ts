import { Module } from '@nestjs/common';
import { CoreApicuronModule } from 'src/core/core.module';
import { ResourceManagerGuard } from './guards/resource-manager-only.guard';
import { ResourceManagerService } from './services/resource-manager.service';

@Module({
	imports: [CoreApicuronModule],
	controllers: [],
	providers: [ResourceManagerGuard, ResourceManagerService],
	exports: [ResourceManagerGuard, ResourceManagerService],
})
export class ResourceManagerModule {}

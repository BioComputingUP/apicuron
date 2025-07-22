import { Module } from '@nestjs/common';
import { ResourceManagerGuard } from './guards/resource-manager-only.guard';

@Module({
	imports: [],
	controllers: [],
	providers: [ResourceManagerGuard],
	exports: [ResourceManagerGuard],
})
export class ResourceManagerModule {}

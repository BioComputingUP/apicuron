import { Injectable, OnModuleInit } from '@nestjs/common';
import { ComputeResourceStatsService } from './compute-resource-stats.service';

@Injectable()
export class InitResourceStatsService implements OnModuleInit {
	constructor(
		protected computeResourceStatsService: ComputeResourceStatsService,
	) {}

	async onModuleInit() {
		await this.computeResourceStatsService.computeAllResourceStats();
	}
}

import { Body, Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';
import { MigrateResourceDto } from './dto/migrate-resource.dto';

@Controller({ path: 'admin', version: '2' })
export class AdminController {
	constructor(protected adminService: AdminService) {}

	@Post('migrate-resource')
	async migrate_resource(@Body() reqBody: MigrateResourceDto) {
		await this.adminService.migrate_resource(
			reqBody.resource_id,
			reqBody.admin_orcids,
			reqBody.base_url,
			reqBody.overwrite,
		);

		return {
			status: 'success',
			message: `Resource ${reqBody.resource_id} migrated successfully`,
		};
	}
}

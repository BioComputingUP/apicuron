import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { UsersService } from './auth/users/services/users.service';
import { ReportsService } from './reports/reports.service';
import { PartnerResourcesService } from './resources/partner-resources/services/partner-resources.service';
import { InjectModel } from '@nestjs/mongoose';
import {
	AchievementDef,
	AchievementDefModel,
} from './core/schemas/achievements-def/achievement-def.schema';
import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
@Controller()
export class AppController {
	constructor(
		protected partnerResourceService: PartnerResourcesService,
		protected userService: UsersService,
		protected reportService: ReportsService,
		@InjectModel(AchievementDef.name)
		protected achievementDefModel: AchievementDefModel,
		protected storageService: StorageService,
	) {}

	@ApiExcludeEndpoint()
	@Get('/home')
	async get_home_data() {
		const resource_count_promise = this.partnerResourceService.count();
		const user_count_promise = this.userService.count();
		const report_count_promise = this.reportService.all_reports_count();
		const achievement_count_promise = this.achievementDefModel.countDocuments();
		const [resource_count, user_count, report_count, achievement_count] =
			await Promise.all([
				resource_count_promise,
				user_count_promise,
				report_count_promise,
				achievement_count_promise,
			]);
		return {
			resource_count,
			user_count,
			report_count,
			achievement_count,
		};
	}
}

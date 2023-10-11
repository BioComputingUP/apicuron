import { Controller, Get, InternalServerErrorException } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { AchievementsDefService } from './achievements/achievements-def.service';
import { AppService } from './app.service';
import { UsersService } from './auth/users/users.service';
import { ReportsService } from './reports/reports.service';
import { PartnerResourcesService } from './resources/partner-resources/partner-resources.service';
import { getMetadataStorage } from 'class-validator';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		protected partnerResourceService: PartnerResourcesService,
		protected userService: UsersService,
		protected reportService: ReportsService,
		protected achievementsService: AchievementsDefService,
	) {}

	@Get('/debug-sentry')
	getHello(): string {
		throw new InternalServerErrorException('Sentry debug test');
		// return this.appService.getHello();
	}
	@ApiExcludeEndpoint()
	@Get('/home')
	async get_home_data() {
		const resource_count_promise = this.partnerResourceService.count();
		const user_count_promise = this.userService.count();
		const report_count_promise = this.reportService.all_reports_count();
		const achievement_count_promise = this.achievementsService.count();
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

	@Get('jsonschema')
	async getJsonSchema() {
		// const { defaultMetadataStorage } = require('class-transformer/cjs/storage');
		// return validationMetadatasToSchemas({
		// 	classValidatorMetadataStorage: getMetadataStorage(),
		// });
		const storage = getMetadataStorage();
		console.log(storage);
		return storage;
	}
}

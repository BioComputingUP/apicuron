import { Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "src/core/schemas/user.schema";
import { TaskArgument } from "src/scheduler-client/types/baseTask";
import { OrcidClientService } from "../orcid-client/orcid-client.service";
import { Cron, CronExpression } from "@nestjs/schedule";




export class OrcidSyncService {
	constructor(
		@InjectModel(User.name) protected userModel:  Model<UserDocument>,
		protected orcidClientService: OrcidClientService
	) {}
	logger = new Logger(OrcidSyncService.name);


	async update_user_info(user: User){

		//TODO : check if user values haven't change to skip them
		try {
			const extra_orcid_info = await this.orcidClientService.get_user_info(
				user.orcid_id,
			);
			return this.userModel.updateOne(
					{ orcid_id: user.orcid_id },
					{ $set: extra_orcid_info },
				);
		} catch (error) {
			this.logger.error(`Error getting infor for user ${user.orcid_id}`);
			this.logger.error(error);
		}
	}
	
	async update_all_user_info() {
		// Get all user Ids from database
		const all_users = await this.userModel.find().lean().select('orcid_id');

		const updates = [];
		this.logger.log('Getting all users information...');
		for await (const user of all_users) {
			updates.push(this.update_user_info(user))
		}
		try {
			this.logger.log('Updating all users information...');
			await Promise.all(updates); 
			this.logger.log('Done.');
			return;
		} catch (err) {
			this.logger.error(err);
		}
	}
	@Cron(CronExpression.EVERY_6_HOURS)
	async update_task() {
		return await this.update_all_user_info();
	}

}
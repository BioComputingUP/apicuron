import { Logger } from "@nestjs/common";
import { Model } from "mongoose";
import { User, UserDocument } from "src/core/schemas/user.schema";
import { OrcidClientService } from "src/orcid/orcid-client/orcid-client.service";
import { TaskArgument } from "src/scheduler-client/types/baseTask";
import { InjectModel } from "@nestjs/mongoose";


export class UpdateAllUsersInfoTask{
	constructor(
		protected orcidClientService : OrcidClientService,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
	) {}
	logger = new Logger(UpdateAllUsersInfoTask.name);

	public async run_task(task_arg: TaskArgument) {
		// Get all user Ids from database
		const all_users = await this.userModel.find().lean().select('orcid_id');	
		
		let updates = []
		this.logger.log("Getting all users information...");
		for await (const user of all_users){
			try {
				const extra_orcid_info = await this.orcidClientService.get_user_info(user.orcid_id);
				updates.push(this.userModel.updateOne({orcid_id: user.orcid_id}, {$set: extra_orcid_info}));				
			} catch (error) {
				this.logger.error(`Error getting infor for user ${user.orcid_id}`);
				this.logger.error(error);
			}
		}
		try{
			this.logger.log("Updating all users information...");
			await Promise.all(updates)
			this.logger.log("Done.");
		}catch(err){
			this.logger.error(err);
		}
	

	}
}
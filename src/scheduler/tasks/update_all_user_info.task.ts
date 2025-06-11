import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { User, UserDocument } from 'src/core/schemas/user.schema';
import { OrcidClientService } from 'src/orcid/orcid-client/orcid-client.service';

export class UpdateAllUsersInfoTask {
	constructor(
		protected orcidClientService: OrcidClientService,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
	) {}
	logger = new Logger(UpdateAllUsersInfoTask.name);

	public async run_task() {
		// Get all user Ids from database
		const all_users = await this.userModel.find().lean().select('orcid_id');

		const updates: Promise<UpdateWriteOpResult>[] = [];
		this.logger.log('Getting all users information...');
		for await (const user of all_users) {
			try {
				const extra_orcid_info = await this.orcidClientService.get_user_info(
					user.orcid_id,
				);
				updates.push(
					this.userModel
						.updateOne({ orcid_id: user.orcid_id }, { $set: extra_orcid_info })
						.exec(),
				);
			} catch (error) {
				this.logger.error(`Error getting infor for user ${user.orcid_id}`);
				this.logger.error(error);
			}
		}
		try {
			this.logger.log('Updating all users information...');
			await Promise.all(updates);
			this.logger.log('Done.');
		} catch (err) {
			this.logger.error(err);
		}
	}
}

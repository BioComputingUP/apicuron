import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { achievements_v1_pipeline } from './aggregation-pipeline/achievements.pipeline';
import { browse_v1_pipeline } from './aggregation-pipeline/browse.pipeline';
import { User, UserDocument } from './schemas/user.schema';
import { uuid } from 'uuidv4';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { generateAvatar } from './generate_avatar';
@Injectable()
export class UsersService {
	private readonly userServiceLogger = new Logger(UsersService.name);
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		protected configService: ConfigService,
	) {}

	public async user_exists(orcid_id: string): Promise<Boolean> {
		return !!(await this.userModel.exists({
			orcid_id,
		}));
	}

	async getPrivateUser(query: Partial<User>): Promise<User> {
		const user_promise = this.userModel.findOne(
			query,
			{
				stats: 0,
			},
		);

		return await user_promise;
	}

	async get_by_orcid(orcid_id: string): Promise<User> {
		const user_promise = this.userModel.findOne(
			{
				orcid_id,
			},
			{
				stats: 0,
				orcid_permission: 0,
				refresh_token: 0
			},
		);

		return await user_promise;
	}

	async get_by_cookie_token(cookie_token: string): Promise<User> {
		return await this.userModel.findOne({
			cookie_token,
		});
	}

	async update_user(orcid_id: string, updates: Partial<User>) {
		return await this.userModel.updateOne(
			{
				orcid_id,
			},
			updates,
		);
	}

	async get_user_token(username: string): Promise<string> {
		return await this.userModel.findOne(
			{
				username,
			},
			{
				jwt_token: true,
			},
		);
	}

	async createUser(user: any): Promise<User> {
		const newUser = new this.userModel(user);

		const avatarLink = await generateAvatar(
			newUser.displayedName,
			this.configService.get('PUBLIC_FILES_PATH'),
			this.configService.get('PUBLIC_FILES_URL_PATH'),
		);
		newUser.avatar = avatarLink;

		return await newUser.save();
	}

	async createOrUpdateUser({ orcid_id, ...data }: Partial<User>) {
		const exists = await this.userModel.exists({ orcid_id });
		if (exists) {
			await this.userModel.updateOne({ orcid_id }, data);
		} else {
			return await this.createUser({ orcid_id, ...data });
		}
	}

	async get_users_with_stats(params) {
		const aggregation_pipeline = browse_v1_pipeline(params);

		return await this.userModel.aggregate(aggregation_pipeline);
	}

	async get_achievements(params) {
		const pipeline = achievements_v1_pipeline(params);

		return await this.userModel.aggregate(pipeline);
	}

	async count() {
		return await this.userModel.count();
	}
}

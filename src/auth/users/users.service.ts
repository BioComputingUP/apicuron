import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { achievements_v1_pipeline } from './aggregation-pipeline/achievements.pipeline';
import { browse_v1_pipeline } from './aggregation-pipeline/browse.pipeline';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
	private readonly userServiceLogger = new Logger(UsersService.name);
	constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

	async get_by_orcid(orcid_id: string): Promise<User> {
		return await this.userModel.findOne({
			orcid_id,
		});
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

	async create_user(user: User): Promise<User> {
		const newUser = new this.userModel(user);
		return newUser.save();
	}

	async upsert_user(orcid_id: string, data: Partial<User>) {
		return await this.userModel.updateOne(
			{ orcid_id },
			{ ...data, $setOnInsert: { role: 'user' } },
			{ upsert: true },
		);
	}


	async get_users_with_stats(params){
		const aggregation_pipeline = browse_v1_pipeline(params)

		return await this.userModel.aggregate(aggregation_pipeline)
	}

	async get_achievements(params){
		const pipeline = achievements_v1_pipeline(params)

		return await this.userModel.aggregate(pipeline)
	}

	async count(){
		return await this.userModel.count()
	}
}

import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { achievements_v1_pipeline } from '../aggregation-pipeline/achievements.pipeline';
import { browse_v1_pipeline } from '../aggregation-pipeline/browse.pipeline';
import { User, UserDocument } from '../../../core/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { generateAvatar } from '../generate_avatar';
import { PrivacyType } from '../../../core/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserPrivacyUpdatedEvent } from '../events/update-privacy';
import { ICreateOrUpdateUser } from '../dto/create-or-update-user.dto';
import { ResourceDocument } from '../../../core/schemas/resource/resource.schema';
import { UserUpdatedEvent } from '../events/user-updated';
import { UserCreatedEvent } from '../events/user-created';
@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		protected configService: ConfigService,
		protected eventEmitter: EventEmitter2,
	) {}

	public async userExists(orcid_id: string): Promise<boolean> {
		return !!(await this.userModel.exists({
			orcid_id,
		}));
	}

	async getPrivateUser(query: Partial<User>): Promise<UserDocument> {
		const user_promise = this.userModel.findOne(query, {
			stats: 0,
		});

		return await user_promise;
	}

	async getByOrcid(orcid_id: string): Promise<UserDocument> {
		const user_promise = await this.userModel.findOne(
			{
				orcid_id,
			},
			{
				stats: 0,
				orcid_permission: 0,
				refresh_token: 0,
				orcid_work_put_codes: 0,
			},
		);

		return await user_promise;
	}

	/**
	 * Get users by orcid_ids, maintains order and returns a list of UserEntity matching the orcid_ids order
	 * @param orcid_ids List of orcid_ids
	 * @returns list of users from the database
	 */
	async getUsersByOrcid(orcid_ids: string[]): Promise<UserDocument[]> {
		const users = await this.userModel.find({ orcid_id: { $in: orcid_ids } });

		const sortedUsers = orcid_ids.map(
			(orcid_id): UserDocument =>
				users.find((user) => user.orcid_id === orcid_id),
		);

		return sortedUsers;
	}

	/**
	 * Retrieves a public user profile based on the provided ORCID ID.
	 *
	 * @param orcid_id - The ORCID ID of the user to retrieve.
	 * @param userReq - Optional. The user making the request. If the requesting user is the profile holder, privacy checks are bypassed.
	 * @returns A promise that resolves to the user profile if found and public, or the full profile if the requesting user is the profile holder.
	 */
	async getPublicUser(orcid_id: string, userReq?: User) {
		// if the user requesting is the profile holder. We do not need to check privacy
		if (userReq?.orcid_id === orcid_id) {
			return await this.getByOrcid(orcid_id);
		}
		// otherwise (if the user is not the profile holder) we need to check privacy
		const user_promise = this.userModel.findOne(
			{
				orcid_id,
				privacy: PrivacyType.public,
			},
			{
				stats: 0,
				orcid_permission: 0,
				refresh_token: 0,
				orcid_work_put_codes: 0,
			},
		);

		return await user_promise;
	}

	async get_by_cookie_token(cookie_token: string): Promise<User> {
		return await this.userModel.findOne({
			cookie_token,
		});
	}

	async updateUser(
		orcidOrUser: string | UserDocument,
		updates: UpdateQuery<UserDocument>,
	) {
		const receivedOrcid = typeof orcidOrUser === 'string';

		const orcid = receivedOrcid ? orcidOrUser : orcidOrUser.orcid_id;

		const before = receivedOrcid
			? await this.userModel.findOne({ orcid_id: orcid })
			: orcidOrUser;
		const user = await this.userModel.findOneAndUpdate(
			{
				orcid_id: orcid,
			},
			updates,
			{
				new: true,
			},
		);
		await this.eventEmitter.emitAsync(
			UserUpdatedEvent.name,
			new UserUpdatedEvent(before, user, updates),
		);

		return user;
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

	async createUser(user: ICreateOrUpdateUser): Promise<UserDocument> {
		const newUser = new this.userModel(user);

		const avatarLink = await generateAvatar(
			newUser.displayedName,
			this.configService.get('PUBLIC_FILES_PATH'),
			this.configService.get('PUBLIC_FILES_URL_PATH'),
		);
		newUser.avatar = avatarLink;

		await newUser.save();

		await this.eventEmitter.emitAsync(
			UserCreatedEvent.name,
			new UserCreatedEvent(newUser),
		);

		return newUser;
	}

	async createOrUpdateUser({
		orcid_id,
		...data
	}: ICreateOrUpdateUser): Promise<UserDocument> {
		const oldUser = await this.userModel.findOne({ orcid_id });

		// upsert user
		const newUser = !!oldUser
			? await this.updateUser(orcid_id, { $set: data })
			: await this.createUser({ orcid_id, ...data });

		if (oldUser?.privacy !== newUser.privacy) {
			await this.eventEmitter.emitAsync(
				UserPrivacyUpdatedEvent.name,
				new UserPrivacyUpdatedEvent(newUser, newUser.privacy),
			);
		}

		return newUser;
	}

	async addManagedResource(orcid_id: string, resource: ResourceDocument) {
		return await this.updateUser(orcid_id, {
			$push: {
				resources: {
					resource_id: resource.resource_id,
					name: resource.resource_name,
				},
			},
		});
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

	async getUserPrivacy(orcid_id: string): Promise<PrivacyType> {
		const { privacy } = await this.userModel.findOne(
			{ orcid_id },
			{ privacy: 1 },
		);

		return privacy;
	}

	async getUsers(filter: FilterQuery<UserDocument>): Promise<UserDocument[]> {
		return await this.userModel.find(filter);
	}
}

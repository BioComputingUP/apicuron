import {
	Injectable,
	InternalServerErrorException,
	Logger,
	UnauthorizedException,
} from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { achievements_v1_pipeline } from '../aggregation-pipeline/achievements.pipeline';
import { browse_v1_pipeline } from '../aggregation-pipeline/browse.pipeline';
import { User, UserDocument } from '../../../core/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { generateAvatar } from '../generate_avatar';
import { PrivacyType } from '../../../core/enums';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserPrivacyUpdatedEvent } from '../events/update-privacy';
import {
	ICreateOrUpdateUser,
	ICreateUser,
} from '../dto/create-or-update-user.dto';
import { ResourceDocument } from '../../../core/schemas/resource/resource.schema';
import {
	UserCreatedEvent,
	UserRepository,
} from '../../../core/repositories/user.repository';
import { EmailDto, UpdateProfileDto } from '../dto/update-user.dto';
import { StorageService } from '@biocomputingup/nest-storage-manager/dist/services/storage.service';
import { v4 as uuid } from 'uuid';
import { PrivateUserEntity, UserEntity } from '../dto/user.entity';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class UsersService {
	logger = new Logger(UsersService.name);
	constructor(
		private userRepository: UserRepository,
		protected configService: ConfigService,
		protected eventEmitter: EventEmitter2,
		protected storageService: StorageService,
	) {}

	public async userExists(orcid_id: string): Promise<boolean> {
		return !!(await this.userRepository.findOne({
			orcid_id,
		}));
	}

	async getPrivateUser(query: Partial<User>): Promise<PrivateUserEntity> {
		const userDoc = await this.userRepository.findOne(query, {
			stats: 0,
		});

		const userEntity = plainToInstance(PrivateUserEntity, userDoc, {
			enableCircularCheck: true,
			excludeExtraneousValues: true,
		});

		return userEntity;
	}

	async getByOrcid(orcid_id: string): Promise<UserDocument | null> {
		const user_promise = await this.userRepository.findOne(
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

		return user_promise;
	}

	/**
	 * Get users by orcid_ids, maintains order and returns a list of UserEntity matching the orcid_ids order
	 * @param orcid_ids List of orcid_ids
	 * @returns list of users from the database
	 */
	async getUsersByOrcid(orcid_ids: string[]): Promise<User[]> {
		const users = await this.userRepository.find({
			orcid_id: { $in: orcid_ids },
		});

		const sortedUsers = orcid_ids.map(
			(orcid_id): User => users.find((user) => user.orcid_id === orcid_id),
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
	async getPublicUser(
		orcid_id: string,
		userReq?: User,
	): Promise<UserEntity | PrivateUserEntity> {
		// if the user requesting is the profile holder. We do not need to check privacy
		if (userReq?.orcid_id === orcid_id) {
			return await this.getPrivateUser({ orcid_id });
		}
		// otherwise (if the user is not the profile holder) we need to check privacy
		const user = await this.userRepository.findOne(
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

		const userObj: UserEntity = this.mapDocumentToEntity(user);

		const userEntity = plainToInstance(UserEntity, userObj, {
			excludeExtraneousValues: true,
			enableCircularCheck: true,
		});

		return userEntity;
	}

	mapDocumentToEntity(userDoc: UserDocument): UserEntity {
		return {
			...userDoc.toObject(),
			// employment: userDoc.employment[userDoc.employment.length - 1].name,
			employment: userDoc.affiliation,
		};
	}

	async get_by_cookie_token(cookie_token: string): Promise<UserDocument> {
		return await this.userRepository.findOne({
			cookie_token,
		});
	}

	async updateUser(
		orcidOrUser: string | UserDocument,
		updates: UpdateQuery<UserDocument>,
	): Promise<PrivateUserEntity> {
		const receivedOrcid = typeof orcidOrUser === 'string';

		const orcid = receivedOrcid ? orcidOrUser : orcidOrUser.orcid_id;

		const filter = { orcid_id: orcid };
		const user = await this.userRepository.updateOne(filter, updates);

		const userEntity = plainToInstance(PrivateUserEntity, user, {
			excludeExtraneousValues: true,
			enableCircularCheck: true,
		});

		return userEntity;
	}

	async get_user_token(username: string): Promise<string> {
		const result = await this.userRepository.findOne(
			{
				username,
			},
			{
				jwt_token: true,
			},
		);
		return result.jwt_token;
	}

	async createUser(user: ICreateUser): Promise<PrivateUserEntity> {
		const avatarSvg = await generateAvatar(user.displayedName);

		const avatarLink = await this.storageService.put(
			`users/${uuid()}.svg`,
			Buffer.from(avatarSvg),
		);
		const newUser = this.userRepository.newDocument({
			...user,
			privacy: PrivacyType.private,
			role: 'user',
			cookie_token: uuid(),
			last_update: new Date(),
			emails: [],
			jwt_token: undefined,
			orcid_work_put_codes: [],
			avatar: avatarLink,
			resources: [],
		});

		newUser.avatar = avatarLink;

		await newUser.save();

		await this.eventEmitter.emitAsync(
			UserCreatedEvent.name,
			new UserCreatedEvent(newUser.orcid_id, newUser, new Date()),
		);

		const userEntity = plainToInstance(PrivateUserEntity, newUser, {
			excludeExtraneousValues: true,
			enableCircularCheck: true,
		});

		return userEntity;
	}

	async createOrUpdateUser({
		orcid_id,
		...data
	}: ICreateOrUpdateUser): Promise<PrivateUserEntity> {
		const oldUser = await this.userRepository.findOne({ orcid_id });

		// upsert user
		const newUser = !!oldUser
			? await this.updateUser(orcid_id, { $set: data })
			: await this.createUser({ orcid_id, ...data } as ICreateUser); // TODO: check if this is correct

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

		return await this.userRepository.aggregate(aggregation_pipeline);
	}

	async get_achievements(params) {
		const pipeline = achievements_v1_pipeline(params);

		return await this.userRepository.aggregate(pipeline);
	}

	async count() {
		return await this.userRepository.count();
	}

	async getUserPrivacy(orcid_id: string): Promise<PrivacyType> {
		const { privacy } = await this.userRepository.findOne(
			{ orcid_id },
			{ privacy: 1 },
		);

		return privacy;
	}

	async getUsers(filter: FilterQuery<User>): Promise<User[]> {
		return await this.userRepository.find(filter);
	}

	async updateUserProfile(updates: UpdateProfileDto): Promise<User> {
		const { orcid_id, email, ...otherUpdates } = updates;

		if (email) {
			try {
				await this.handleEmailUpdate(orcid_id, email);
			} catch (error: unknown) {
				this.logger.error(`Error updating email for user ${orcid_id}:`, error);
				if (error instanceof UnauthorizedException) {
					throw error; // Re-throw UnauthorizedException
				} else {
					// Handle other errors, e.g., log them or throw a generic error

					throw new InternalServerErrorException(
						'An error occurred while updating the email',
					);
				}
			}
		}
		const updatedUser = await this.userRepository.findOneAndUpdate(
			{ orcid_id },
			{ $set: otherUpdates },
			{ new: true },
		);
		if (!updatedUser) {
			throw new UnauthorizedException('User not found');
		}
		if (otherUpdates.privacy) {
			await this.eventEmitter.emitAsync(
				UserPrivacyUpdatedEvent.name,
				new UserPrivacyUpdatedEvent(
					updatedUser.toObject(),
					otherUpdates.privacy,
				),
			);
		}
		return updatedUser;
	}

	private async handleEmailUpdate(
		orcid_id: string,
		emailEntry: EmailDto,
	): Promise<void> {
		if (!emailEntry?.email) {
			throw new UnauthorizedException('Email address is required');
		}

		const emailMatchedUser = await this.userRepository.findOne({
			emails: { $elemMatch: { email: emailEntry.email } },
		});

		if (emailMatchedUser) {
			if (emailMatchedUser.orcid_id !== orcid_id) {
				// Email belongs to another user
				throw new UnauthorizedException(
					'The provided email is already used by another user',
				);
			} else {
				// Update existing email for the same user
				// Find the current email object to get the original email for the array filter
				const currentUser = await this.userRepository.findOne({ orcid_id });
				if (!currentUser) {
					throw new UnauthorizedException('User not found');
				}

				// Find the existing email object that matches the new email
				const existingEmailObj = currentUser.emails?.find(
					(e) => e.email === emailEntry.email,
				);

				if (existingEmailObj) {
					// Update the existing email object
					await this.userRepository.findOneAndUpdate(
						{ orcid_id },
						{
							$set: {
								// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
								'emails.$[elem]': {
									...existingEmailObj.toObject(),
									...emailEntry,
								},
							},
						},
						{
							arrayFilters: [{ 'elem.email': emailEntry.email }],
							new: true,
						},
					);
				}
			}
		} else {
			// Add new email
			await this.userRepository.findOneAndUpdate(
				{ orcid_id },
				{
					$push: {
						emails: {
							...emailEntry,
							verified: false,
						},
					},
				},
				{ new: true },
			);
		}
	}
}

import { StorageService } from '@biocomputingup/nest-storage-manager';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { assertIsDefined } from 'src/util/type-assertion.helper';
import { v4 as uuid } from 'uuid';
import { PrivacyType } from '../../../core/enums';
import {
	UserCreatedEvent,
	UserRepository,
} from '../../../core/repositories/user.repository';
import { ResourceDocument } from '../../../core/schemas/resource/resource.schema';
import { User, UserDocument } from '../../../core/schemas/user.schema';
import { browse_v1_pipeline } from '../aggregation-pipeline/browse.pipeline';
import {
	ICreateOrUpdateUser,
	ICreateUser,
} from '../dto/create-or-update-user.dto';
import { UpdateProfileDto } from '../dto/update-user.dto';
import { PrivateUserEntity, UserEntity } from '../dto/user.entity';
import { UserPrivacyUpdatedEvent } from '../events/update-privacy';
import { generateAvatar } from '../generate_avatar';
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
		assertIsDefined(user, 'User not found');
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

	async get_by_cookie_token(
		cookie_token: string,
	): Promise<UserDocument | null> {
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
		const user = await this.userRepository.updateOne(filter, updates, {
			new: true,
		});

		const userEntity = plainToInstance(PrivateUserEntity, user, {
			excludeExtraneousValues: true,
			enableCircularCheck: true,
		});

		return userEntity;
	}

	async createUser(user: ICreateUser): Promise<PrivateUserEntity> {
		const avatarSvg = await generateAvatar(user.displayedName);

		const avatarLink = await this.storageService.put(
			`users/${uuid()}.svg`,
			Buffer.from(avatarSvg),
		);
		const newUser: User = {
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
		};

		newUser.avatar = avatarLink;

		await this.userRepository.create(newUser);

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
			: await this.createUser({ orcid_id, ...data } as ICreateUser);

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

	async count() {
		return await this.userRepository.count();
	}

	async getUserPrivacy(orcid_id: string): Promise<PrivacyType> {
		const user = await this.userRepository.findOne(
			{ orcid_id },
			{ privacy: 1 },
		);

		assertIsDefined(user, 'User not found');
		return user.privacy;
	}

	async getUsers(filter: FilterQuery<User>): Promise<User[]> {
		return await this.userRepository.find(filter);
	}

	async updateUserProfile(updates: UpdateProfileDto): Promise<User> {
		const { orcid_id, ...otherUpdates } = updates;

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
}

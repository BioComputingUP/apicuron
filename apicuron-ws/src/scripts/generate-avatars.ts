import { INestApplicationContext, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { existsSync } from 'fs';
import { Model } from 'mongoose';
import { join } from 'path';
import { throwError } from 'src/util/error.utils';
import { AppModule } from '../app.module';
import { generateAvatar } from '../auth/users/generate_avatar';
import { User, UserDocument } from '../core/schemas/user.schema';

export async function bootstrap(app: INestApplicationContext) {
	const userModel: Model<UserDocument> = app.get(getModelToken(User.name));
	const config: ConfigService = app.get(ConfigService);

	const logger = new Logger('GenerateAvatarScript');

	// await userModel.updateMany({}, { $unset: { avatar: '' }})

	const usersCursor = userModel.find({
		orcid_id: { $exists: true },
	});

	const userSavePromises: Promise<UserDocument>[] = [];

	async function addAvatarToUser(user: UserDocument): Promise<UserDocument> {
		const avatarSvg = await generateAvatar(user.displayedName);

		if (
			existsSync(
				join(
					config.get('PUBLIC_FILES_PATH') ??
						throwError(Error, 'PUBLIC_FILES_PATH is not defined'),
					user.avatar,
				),
			)
		) {
			return user;
		}

		logger.log(
			`Generated Avatar for user "${user.displayedName} saved in ${avatarSvg}"`,
		);

		user.avatar = avatarSvg;
		const updatedUser = await user.save();

		logger.log(`Updated user ${user.displayedName}"`);

		return updatedUser;
	}

	try {
		for await (const user of usersCursor) {
			userSavePromises.push(addAvatarToUser(user));
		}
		await Promise.all(userSavePromises);
	} catch (error) {
		logger.error(error.stack);
	}
}

if (require.main === module) {
	async function main() {
		const app = await NestFactory.createApplicationContext(AppModule);
		await bootstrap(app);
		await app.close();
	}

	void main();
}

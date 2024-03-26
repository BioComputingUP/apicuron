import { NestFactory } from '@nestjs/core';
import { Logger, INestApplicationContext } from '@nestjs/common';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../core/schemas/user.schema';
import { Model } from 'mongoose';
import { generateAvatar } from '../auth/users/generate_avatar';
import { ConfigService } from '@nestjs/config';
import { existsSync } from 'fs';
import { join } from 'path';

export async function bootstrap(app: INestApplicationContext) {
	const userModel: Model<UserDocument> = app.get(getModelToken(User.name));
	const config: ConfigService = app.get(ConfigService);

	const logger = new Logger('GenerateAvatarScript');

	// await userModel.updateMany({}, { $unset: { avatar: '' }})

	const usersCursor = userModel.find({
		orcid_id: { $exists: true },
	});

	const userSavePromises: Promise<UserDocument>[] = [];

	async function addAvatarToUser(user: UserDocument) {
		const avatarPath = await generateAvatar(
			user.displayedName,
			config.get('PUBLIC_FILES_PATH'),
			config.get('PUBLIC_FILES_URL_PATH'),
		);

		if (existsSync(join(config.get('PUBLIC_FILES_PATH'), user.avatar))) {
			return null;
		}

		logger.log(
			`Generated Avatar for user "${user.displayedName} saved in ${avatarPath}"`,
		);

		user.avatar = avatarPath;
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

	main();
}

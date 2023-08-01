import { NestFactory } from '@nestjs/core';
import { Logger, INestApplicationContext } from '@nestjs/common';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User, UserDocument } from '../auth/users/schemas/user.schema';
import { Model } from 'mongoose';
import { generateAvatar } from '../auth/users/generate_avatar';
import { ConfigService } from '@nestjs/config';

export async function bootstrap(app: INestApplicationContext) {
	const userModel: Model<UserDocument> = app.get(getModelToken(User.name));
	const config: ConfigService = app.get(ConfigService);

	const logger = new Logger('GenerateAvatarScript');

	const usersCursor = userModel.find({
		orcid_id: { $exists: true },
		avatar: { $exists: false },
	});

	const userSavePromises: Promise<UserDocument>[] = [];

	async function addAvatarToUser(user: UserDocument) {
		const avatarPath = await generateAvatar(
			user.displayedName,
			config.get('PUBLIC_FILES_PATH'),
			config.get('PUBLIC_FILES_URL_PATH'),
		);

		logger.log(
			`Generated Avatar for user "${user.displayedName} saved in ${avatarPath}"`,
		);

		user.avatar = avatarPath;
		const updatedUser = await user.save();

		logger.log(`Updated user ${user.displayedName}"`);

		return updatedUser;
	}

	for await (const user of usersCursor) {
		userSavePromises.push(addAvatarToUser(user));
	}

	await Promise.all(userSavePromises);

	await app.close();
}

if (require.main == module) {
	async function main() {
		const app = await NestFactory.createApplicationContext(AppModule);
		await bootstrap(app);
	}

	main();
}

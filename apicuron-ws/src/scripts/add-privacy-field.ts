import { NestApplicationContext, NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { User, UserDocument } from '../core/schemas/user.schema';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { INestApplicationContext, Logger } from '@nestjs/common';

export async function addPrivacyField(app: INestApplicationContext) {
	const userModel: Model<UserDocument> = app.get(getModelToken(User.name));

	const logger = new Logger('AddPrivacyField');

	const updateResult = await userModel.updateMany(
		{
			privacy: { $exists: false },
		},
		{
			$set: {
				privacy: 'public',
			},
		},
	);

	logger.log(
		`Added ${updateResult.modifiedCount} privacy fields to missing fields in user collection`,
	);
}

async function bootstrap() {
	const app: INestApplicationContext =
		await NestFactory.createApplicationContext(AppModule);

	await addPrivacyField(app);

	await app.close();
}

if (require.main === module) {
	bootstrap();
}

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from 'src/app.module';
import { UserDocument, User } from 'src/core/schemas';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const userModel: Model<UserDocument> = app.get(getModelToken(User.name));

	const logger = new Logger('UpdateLoginDataScript');
	logger.debug('Updating Login Data');
	const updateResult = await userModel.updateMany(
		{},
		{
			$set: {
				isNewLogin: true,
			},
		},
	);

	logger.log(
		`Updated ${updateResult.modifiedCount} login data in user collection`,
	);
	await app.close();
}

bootstrap();

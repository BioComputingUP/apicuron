import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../../app.module';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const logger = new Logger('AddResourceIDToLeague');

	const resourceModel: Model<PartnerResourceDocument> = app.get(
		getModelToken(PartnerResource.name),
	);

	const saves$: Promise<void>[] = [];
	const resources = await resourceModel.find({});
	for (const resource of resources) {
		for (let i = 0; i < resource.leagues.length; i++) {
			resource.leagues[i].resource_id = resource.resource_id;
			if (!resource.leagues[i].displayedName) {
				resource.leagues[i].displayedName = resource.leagues[i].name;
			}
		}
		if (!resource.joined_date) {
			resource.joined_date = resource._id.getTimestamp();
		}

		const save = resource.save().then(() => {
			logger.log(`Updated resource ${resource.resource_id}`);
		});
		saves$.push(save);
	}

	await Promise.all(saves$);

	await app.close();
}

bootstrap();

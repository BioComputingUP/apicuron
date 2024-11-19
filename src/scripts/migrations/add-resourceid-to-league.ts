import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getModelToken } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { Model } from 'mongoose';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const resourceModel: Model<PartnerResourceDocument> = app.get(
		getModelToken(PartnerResource.name),
	);

	const saves$ = [];
	const resources = await resourceModel.find({});
	for (const resource of resources) {
		for (let i = 0; i < resource.leagues.length; i++) {
			resource.leagues[i].resource_id = resource.resource_id;
			if (!resource.leagues[i].displayedName) {
				resource.leagues[i].displayedName = resource.leagues[i].name;
			}
		}

		const save = resource.save().then(() => {
			console.log(`Updated resource ${resource.resource_id}`);
		});
		saves$.push(save);
	}

	await Promise.all(saves$);

	await app.close();
}

bootstrap();

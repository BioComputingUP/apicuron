import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { AppModule } from '../app.module';
import { BadgeAggregatorService } from '../badges/services/badge-aggregator.service';
import {
	BadgeDef,
	BadgeDefDocument,
} from '../core/schemas/achievements-def/badge-def.schema';
import { BadgeDocument } from '../core/schemas/achievements/badges.schema';
import { PartnerResourcesService } from '../resources/partner-resources/services/partner-resources.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const badgeDefModel: Model<BadgeDefDocument> = app.get(
		getModelToken(BadgeDef.name),
	);

	const badgeModel: Model<BadgeDocument> = app.get(getModelToken('Badge'));
	const badgeAggregator: BadgeAggregatorService = app.get(
		BadgeAggregatorService,
	);

	const partnerResources = app.get(PartnerResourcesService);

	const badgeDefs = await badgeDefModel
		.find()
		.lean()
		.cursor({ batchSize: 100 });

	let updates$: Promise<UpdateWriteOpResult>[] = [];
	for await (const badgeDef of badgeDefs) {
		badgeDef.displayedName = badgeDef.name;
		badgeDef.name = _.kebabCase(badgeDef.name.toLowerCase());
		updates$.push(
			badgeDefModel.updateOne({ _id: badgeDef._id }, badgeDef).exec(),
		);

		if (updates$.length >= 100) {
			await Promise.all(updates$);
			updates$ = [];
		}
	}

	await Promise.all(updates$);

	const resources = await partnerResources.get_resources({});

	for (const resource of resources) {
		console.log(`Recomputing badges for resource ${resource.resource_id}`);
		await badgeAggregator.recomputeAllResourceAggregates(resource.resource_id);
	}

	await app.close();
}

bootstrap();

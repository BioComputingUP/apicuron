import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { INestApplicationContext, Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { PrivacyType } from '../../core/enums';
import { Model } from 'mongoose';
import { Term } from '../../core/schemas/terms.schema';
import { AchievementDef } from '../../core/schemas/achievements-def/achievement-def.schema';
import { Report } from '../../core/schemas/reports.schema';
import { Achievement } from '../../core/schemas/achievements/achievements.schema';
import { computePrivacyField } from '../../util/privacy.helper';
import { User, UserDocument } from '../../core/schemas/user.schema';
import {
	IResourceEntity,
	IUserResourceEntity,
} from '../../core/interfaces/user-resource-entity';

async function addLeagueToResources(app: INestApplicationContext) {
	const logger = new Logger(addLeagueToResources.name);
	const resourceModel: Model<PartnerResourceDocument> = app.get(
		getModelToken(PartnerResource.name),
	);

	const resourcesLackingLeague = await resourceModel.find({
		$or: [
			{ leagues: { $exists: false } },
			{ $nor: [{ leagues: { $type: 'array' } }] },
			{ defaultLeague: { $exists: false } },
		],
	});

	const savePromises$ = [];
	for (const resource of resourcesLackingLeague) {
		logger.debug(`Processing resource ${resource.resource_id}`);
		// if (!resource.leagues || !(resource.leagues instanceof Map)) {
		logger.debug(
			`Resource ${resource.resource_id} has no leagues or has wrong type`,
		);
		resource.leagues = [];
		// }
		if (resource.leagues.length === 0) {
			logger.debug(`Resource ${resource.resource_id} has empty league list`);
			resource.leagues.push({
				name: 'default',
				defaultMembers: [],
				visibility: PrivacyType.public,
			});
		}

		if (!resource.defaultLeague) {
			resource.defaultLeague = resource.leagues[0].name;
		}

		const save$ = resource.save();
		savePromises$.push(save$);
	}

	await Promise.all(savePromises$);
}

async function addLeagueToUserResourceEntities(app: INestApplicationContext) {
	const logger = new Logger(addLeagueToUserResourceEntities.name);

	const resourceModel: Model<PartnerResourceDocument> = app.get(
		getModelToken(PartnerResource.name),
	);

	const userModel: Model<UserDocument> = app.get(getModelToken(User.name));

	const reportModel = app.get(getModelToken(Report.name));

	const achievementsModel = app.get(getModelToken(Achievement.name));

	const resources = await resourceModel.find();

	const resourceMap = new Map<string, PartnerResourceDocument>(
		resources.map((r) => [r.resource_id, r]),
	);

	const userMap = new Map<string, UserDocument>();

	for (const model of [
		reportModel,
		achievementsModel,
	] as Model<IUserResourceEntity>[]) {
		logger.debug(`Loading Model ${model.modelName}`);

		const allEntries = model.find({}, {}, { batchSize: 500 }).cursor();

		const entrySaves$ = [];

		for await (const entry of allEntries) {
			try {
				if (!entry.league) {
					entry.league = resourceMap.get(entry.resource_id).defaultLeague;
				}
			} catch (err: any) {
				logger.error(err);
				throw new Error(
					`Error processing entry from model ${model.modelName} with resource_id ${entry.resource_id} and orcid_id ${entry.curator_orcid}`,
				);
			}

			if (!entry.privacy) {
				if (!userMap.has(entry.curator_orcid)) {
					const user = await userModel.findOne({
						orcid_id: entry.curator_orcid,
					});
					userMap.set(entry.curator_orcid, user);
				}
				const user = userMap.get(entry.curator_orcid);
				entry.privacy = computePrivacyField(
					resourceMap.get(entry.resource_id),
					user,
					entry,
				);
			}
			const save$ = entry.save();
			entrySaves$.push(save$);
		}

		await Promise.all(entrySaves$);
	}
}

async function addLeagueToResourceEntities(app: INestApplicationContext) {
	const logger = new Logger(addLeagueToResourceEntities.name);

	const resourceModel: Model<PartnerResourceDocument> = app.get(
		getModelToken(PartnerResource.name),
	);

	logger.debug('Loading Models');

	const termModel = app.get(getModelToken(Term.name));

	const achievementDefModel = app.get(getModelToken(AchievementDef.name));

	const resources = await resourceModel.find();

	const resourceMap = new Map<string, PartnerResourceDocument>(
		resources.map((r) => [r.resource_id, r]),
	);

	for (const model of [
		termModel,
		achievementDefModel,
	] as Model<IResourceEntity>[]) {
		logger.debug(`Loading Model ${model.modelName}`);
		const allEntries = model.find().cursor();

		const entrySaves$ = [];

		for await (const entry of allEntries) {
			try {
				if (!entry.league) {
					entry.league = resourceMap.get(entry.resource_id).defaultLeague;
				}
			} catch (err: any) {
				logger.error(err);
				throw new Error(
					`Error processing entry from model${model.modelName} with resource_id ${entry.resource_id}`,
				);
			}

			if (!entry.privacy) {
				entry.privacy = resourceMap
					.get(entry.resource_id)
					.getLeague(entry.league).visibility;
			}

			const save$ = entry.save();
			entrySaves$.push(save$);
		}

		await Promise.all(entrySaves$);

		logger.debug(`Updated ${model.modelName}`);
	}
}

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	console.log('test');
	await addLeagueToResources(app);
	await addLeagueToResourceEntities(app);
	await addLeagueToUserResourceEntities(app);
	await app.close();
}

bootstrap();

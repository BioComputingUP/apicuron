import { INestApplicationContext, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResourceDocument } from 'src/core/schemas/index';
import { assertIsDefined } from 'src/util/type-assertion.helper';
import { AppModule } from '../../app.module';
import { PrivacyType } from '../../core/enums';
import {
	IResourceEntity,
	IUserResourceEntity,
} from '../../core/interfaces/user-resource-entity';
import { AchievementDef } from '../../core/schemas/achievements-def/achievement-def.schema';
import {
	Achievement,
	AchievementDocument,
} from '../../core/schemas/achievements/achievements.schema';
import { Report, ReportDocument } from '../../core/schemas/reports.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { Term, TermDocument } from '../../core/schemas/terms.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { computePrivacyField } from '../../util/privacy.helper';

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

	const savePromises$: Promise<ResourceDocument>[] = [];
	for (const resource of resourcesLackingLeague) {
		logger.debug(`Processing resource ${resource.resource_id}`);
		// if (!resource.leagues || !(resource.leagues instanceof Map)) {
		logger.debug(
			`Resource ${resource.resource_id} has no leagues or has wrong type`,
		);
		resource.set('leagues', []);
		// }
		if (resource.leagues.length === 0) {
			logger.debug(`Resource ${resource.resource_id} has empty league list`);
			resource.leagues.push({
				name: 'default',
				resource_id: resource.resource_id,
				displayedName: 'Default Group',
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

	const reportModel: Model<ReportDocument> = app.get(
		getModelToken(Report.name),
	);

	const achievementsModel: Model<AchievementDocument> = app.get(
		getModelToken(Achievement.name),
	);

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

		const entrySaves$: Promise<IUserResourceEntity>[] = [];

		for await (const entry of allEntries) {
			try {
				if (!entry.league) {
					const resource = resourceMap.get(entry.resource_id);
					assertIsDefined(
						resource,
						`Resource with resource_id ${entry.resource_id} not found in resourceMap`,
					);
					entry.league = resource.defaultLeague;
				}
			} catch (error: unknown) {
				logger.error(error);
				throw new Error(
					`Error processing entry from model ${model.modelName} with resource_id ${entry.resource_id} and orcid_id ${entry.curator_orcid}`,
				);
			}

			if (!entry.privacy) {
				if (!userMap.has(entry.curator_orcid)) {
					const user = await userModel.findOne({
						orcid_id: entry.curator_orcid,
					});
					assertIsDefined(
						user,
						`User with orcid_id ${entry.curator_orcid} not found in userModel`,
					);
					userMap.set(entry.curator_orcid, user);
				}
				const user = userMap.get(entry.curator_orcid);
				const resource = resourceMap.get(entry.resource_id);
				assertIsDefined(
					resource,
					`Resource with resource_id ${entry.resource_id} not found in resourceMap`,
				);
				entry.privacy = computePrivacyField(resource, user, entry);
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

	const termModel: Model<TermDocument> = app.get(getModelToken(Term.name));

	const achievementDefModel: Model<AchievementDocument> = app.get(
		getModelToken(AchievementDef.name),
	);

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

		const entrySaves$: Promise<IResourceEntity>[] = [];

		for await (const entry of allEntries) {
			const resource = resourceMap.get(entry.resource_id);
			assertIsDefined(
				resource,
				`Resource with resource_id ${entry.resource_id} not found in resourceMap`,
			);
			try {
				if (!entry.league) {
					entry.league = resource.defaultLeague;
				}
			} catch (err: unknown) {
				logger.error(err);
				throw new Error(
					`Error processing entry from model${model.modelName} with resource_id ${entry.resource_id}`,
				);
			}

			if (!entry.privacy) {
				const league = resource.getLeague(entry.league);
				assertIsDefined(
					league,
					`League ${entry.league} not found in resource ${resource.resource_id}`,
				);
				entry.privacy = league.visibility;
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

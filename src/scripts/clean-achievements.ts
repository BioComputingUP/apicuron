// This script removes activity_terms that do not exist anymore on the database from the list_terms of Achievements (badges and medals)

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { AchievementDef } from '../core/schemas/achievement-def.schema';
import { Model } from 'mongoose';
import { Term } from '../core/schemas/terms.schema';
import { Logger } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(AppModule);

	const achDefModel: Model<AchievementDef> = app.get(
		getModelToken(AchievementDef.name),
	);

	const logger = new Logger('CleanAchievements');

	const memoize = {};

	const termsModel: Model<Term> = app.get(getModelToken(Term.name));

	const cursor = achDefModel.find().cursor();

	for await (const achievement of cursor) {
		const {
			resource_id,
			list_terms,
		}: { resource_id: string; list_terms: string[] } = achievement;

		logger.log(`processing achievement ${achievement.name} `);

		const termsExist$ = list_terms.map(async (term) => {
			const exists = await termsModel.exists({
				resource_id,
				activity_term: term,
			});
			memoize[term] = exists;
		});

		const termsExist = await Promise.all(termsExist$);
		const filteredTerms = list_terms.filter((val, index) => {
			return termsExist[index];
		});

		logger.log({
			oldTerms: achievement.list_terms,
			newTerms: filteredTerms,
		});
		achievement.list_terms = filteredTerms;
		await achievement.save();
	}

	await app.close();
}

bootstrap();

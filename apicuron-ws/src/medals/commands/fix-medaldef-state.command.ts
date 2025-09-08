import { Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Command, CommandRunner } from 'nest-commander';
import {
	MedalDef,
	MedalDefModel,
	Term,
	TermDocument,
} from 'src/core/schemas/index';

@Command({
	name: 'fix-medal-def-state',
})
export class FixMedalDefStateCommand extends CommandRunner {
	constructor(
		@InjectModel(MedalDef.name) protected medalDefModel: MedalDefModel,
		@InjectModel(Term.name) protected termModel: Model<TermDocument>,
	) {
		super();
	}

	cachedActivities = new Map<string, TermDocument[]>();

	async getActivitiesForResource(resourceId: string): Promise<TermDocument[]> {
		if (this.cachedActivities.has(resourceId)) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			return this.cachedActivities.get(resourceId)!;
		}
		const activities = await this.termModel.find({ resource_id: resourceId });
		this.cachedActivities.set(resourceId, activities);
		return activities;
	}

	logger = new Logger(FixMedalDefStateCommand.name);

	async run(
		_passedParams: string[],
		_options?: Record<string, any>,
	): Promise<void> {
		const medalDefs = this.medalDefModel.find().batchSize(100).cursor();

		const operations: Promise<unknown>[] = [];

		let fixedCount = 0;

		for await (const medalDef of medalDefs) {
			const terms = await this.getActivitiesForResource(medalDef.resource_id);

			const resourceTermIds = new Set(terms.map((term) => term.activity_term));

			const invalidTerms = medalDef.list_terms.filter(
				(term) => !resourceTermIds.has(term),
			);

			if (invalidTerms.length > 0) {
				this.logger.log(
					`Fixing medal definition ${medalDef.name} for resource ${
						medalDef.resource_id
					}. Invalid terms: ${invalidTerms.join(', ')}`,
				);

				const op = this.medalDefModel
					.updateOne(
						{
							resource_id: medalDef.resource_id,
							name: medalDef.name,
							league: medalDef.league,
						},
						{
							$pull: {
								list_terms: { $in: invalidTerms },
							},
						},
					)
					.exec();
				operations.push(op);
			}

			if (operations.length >= 50) {
				await Promise.allSettled(operations);
				operations.length = 0; // Clear the array
				fixedCount += 50;
			}
		}

		if (operations.length > 0) {
			await Promise.allSettled(operations);
			fixedCount += operations.length;
		}

		console.log(`Fixed ${fixedCount} medal definitions.`);
	}
}

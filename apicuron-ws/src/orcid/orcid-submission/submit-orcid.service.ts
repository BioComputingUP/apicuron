import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
import { PrivacyType } from '../../core/enums';
import { UserRepository } from '../../core/repositories/user.repository';
import { PartnerResourceDocument } from '../../core/schemas/resource/partner-resource.schema';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { responseHasCode } from '../../orcid/orcid-client/helpers/response-with-code';
import { OrcidWork } from '../../orcid/orcid-client/interfaces/orcid.interface';
import { OrcidClientService } from '../../orcid/orcid-client/orcid-client.service';
import { OrcidWorkBuilderToken, RunCronJobs } from './constants';
import { OrcidWorkBuilder } from './interfaces/orcid-submission.interface';

@Injectable()
export class SubmitOrcidWork implements OnModuleInit {
	constructor(
		protected orcidClientService: OrcidClientService,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		@InjectModel(User.name)
		protected userModel: Model<UserDocument>,
		protected userRepository: UserRepository,
		@Inject(OrcidWorkBuilderToken) protected orcidWorkBuilder: OrcidWorkBuilder,
		@Inject(RunCronJobs) protected runCronJobs: boolean,
		protected schedulerRegistry: SchedulerRegistry,
	) {}
	cronJobName = 'SubmitAllWorks' as const;

	onModuleInit() {
		const job = new CronJob(CronExpression.EVERY_DAY_AT_2AM, async () => {
			await this.submitAllWorks();
		});
		if (!this.runCronJobs) {
			this.logger.debug(
				`runCronJobs is false, skipping ${this.cronJobName} cron job registration`,
			);
			return;
		}
		this.schedulerRegistry.addCronJob(this.cronJobName, job);
		job.start();
	}

	defaultBatchSize = 100;
	logger = new Logger(SubmitOrcidWork.name);

	async submitAllWorks(filter: FilterQuery<UserDocument> = {}): Promise<void> {
		const users = this.userRepository
			.find({
				$and: [
					{
						privacy: PrivacyType.public,
						orcid_permission: { $exists: true },
					},
					filter,
				],
			})
			.sort({ displayed_name: 1 })
			.cursor({ batchSize: this.defaultBatchSize });

		for await (const user of users) {
			try {
				const stats = await this.statModel.find({
					curator_orcid: user.orcid_id,
					privacy: PrivacyType.public,
				});

				if (stats.length === 0) {
					this.logger.debug(`No stats found for user ${user.displayedName}`);
					continue;
				}

				// One at a time: each submission may store a put-code on this user
				for (const stat of stats) {
					await this.submitSingleWork(stat, stat.resource.toObject(), user);
				}
			} catch (err: unknown) {
				if (err instanceof Error) {
					this.logger.error(
						`Error processing user ${user.displayedName} (${user.orcid_id})`,
					);
					this.logger.error(err.message, err.stack, err.name);
				}
			}
		}
	}

	async submitSingleWork(
		statsitics: LeanDocument<StatisticsDocument>,
		resource: LeanDocument<PartnerResourceDocument>,
		user: UserDocument,
	): Promise<void> {
		const work: OrcidWork = this.orcidWorkBuilder.buildWork(
			statsitics,
			resource,
			user,
		);
		try {
			const submitResponse = await this.orcidClientService.submitWork(
				user,
				work,
			);

			if (responseHasCode(submitResponse, 201)) {
				this.logger.debug(
					`received put code: ${submitResponse.putCode}, saving the user resource put code`,
				);
				await this.savePutCode(
					user.orcid_id,
					resource.resource_id,
					submitResponse.putCode,
				);
				// keep the in-memory user in sync so later builds in this run use the new put-code
				user.setResourcePutCode(resource.resource_id, submitResponse.putCode);
			}
		} catch (err) {
			if (err instanceof Error) {
				this.logger.error('Error submitting work to ORCID');
				this.logger.error(err.message, err.stack, err.name);
			}
		}
	}

	/**
	 * Stores the put-code of a resource's work with a direct update on the user document,
	 * replacing the existing entry for that resource or adding one.
	 * Unlike user.save(), this does not depend on the document version loaded at the start of the run.
	 */
	private async savePutCode(
		orcid_id: string,
		resource_id: string,
		putCode: string,
	): Promise<void> {
		const replaced = await this.userModel.updateOne(
			{ orcid_id, 'orcid_work_put_codes.resource_id': resource_id },
			{ $set: { 'orcid_work_put_codes.$.putCode': putCode } },
		);
		if (replaced.matchedCount > 0) {
			return;
		}
		await this.userModel.updateOne(
			{ orcid_id, 'orcid_work_put_codes.resource_id': { $ne: resource_id } },
			{ $push: { orcid_work_put_codes: { resource_id, putCode } } },
		);
	}
}

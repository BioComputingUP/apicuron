import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OrcidClientService } from '../../orcid/orcid-client/orcid-client.service';
import { InjectModel } from '@nestjs/mongoose';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { FilterQuery, LeanDocument, Model } from 'mongoose';
import { UserDocument } from '../../core/schemas/user.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { OrcidWorkBuilderToken, RunCronJobs } from './constants';
import { OrcidWorkBuilder } from './interfaces/orcid-submission.interface';
import { OrcidWork } from '../../orcid/orcid-client/interfaces/orcid.interface';
import { responseHasCode } from '../../orcid/orcid-client/helpers/response-with-code';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { PrivacyType } from '../../core/enums';
import { UserRepository } from '../../core/repositories/user.repository';
import { CronJob } from 'cron';

@Injectable()
export class SubmitOrcidWork implements OnModuleInit {
	constructor(
		protected orcidClientService: OrcidClientService,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
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

	async submitAllWorks(filter: FilterQuery<UserDocument> = {}): Promise<any> {
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
			const stats = await this.statModel.find({
				curator_orcid: user.orcid_id,
				privacy: PrivacyType.public,
			});

			if (stats.length === 0) {
				this.logger.debug(`No stats found for user ${user.displayedName}`);
				continue;
			}

			const submissions$: Promise<unknown>[] = [];
			for (const stat of stats) {
				const submission$ = this.submitSingleWork(
					stat,
					stat.resource.toObject(),
					user,
				);
				submissions$.push(submission$);
			}
			await Promise.all(submissions$);
		}
	}

	async submitSingleWork(
		statsitics: LeanDocument<StatisticsDocument>,
		resource: LeanDocument<PartnerResourceDocument>,
		user: UserDocument,
	): Promise<any> {
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

			if (responseHasCode(submitResponse)) {
				this.logger.debug(
					`received put code: ${submitResponse.putCode}, saving the user resource put code`,
				);
				user.setResourcePutCode(resource.resource_id, submitResponse.putCode);
				await user.save();
			}
		} catch (err) {
			if (err instanceof Error) {
				this.logger.error('Error submitting work to ORCID');
				this.logger.error(err.message, err.stack, err.name);
			}
		}
	}
}

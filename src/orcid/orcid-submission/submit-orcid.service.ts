import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrcidClientService } from '../../orcid/orcid-client/orcid-client.service';
import { InjectModel } from '@nestjs/mongoose';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { LeanDocument, Model } from 'mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { OrcidWorkBuilderToken } from './constants';
import { OrcidWorkBuilder } from './interfaces/orcid-submission.interface';
import { OrcidWork } from '../../orcid/orcid-client/interfaces/orcid.interface';
import { responseHasCode } from '../../orcid/orcid-client/helpers/response-with-code';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubmitOrcidWork {
	constructor(
		protected orcidClientService: OrcidClientService,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		@InjectModel(User.name) protected userModel: Model<User>,
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		@Inject(OrcidWorkBuilderToken) protected orcidWorkBuilder: OrcidWorkBuilder,
	) {}

	defaultBatchSize = 100;
	logger = new Logger(SubmitOrcidWork.name);

	@Cron(CronExpression.EVERY_DAY_AT_2AM)
	async submitAllWorks(): Promise<any> {
		const stats = this.statModel
			.find({
				privacy: 'public',
			})
			.sort({
				resource_id: -1,
				curator_orcid: -1,
			})
			.cursor({ batchSize: this.defaultBatchSize });
		async function* statIterator() {
			for await (const stat of stats) {
				await new Promise((r) => setTimeout(r, 1000));
				yield stat;
			}
		}
		let currentResource = null;

		for await (const stat of statIterator()) {
			const user = await this.userModel.findOne({
				orcid_id: stat.curator_orcid,
				orcid_permission: { $exists: true },
			});
			if (!user) {
				continue;
			}

			if (!currentResource) {
				currentResource = await this.resourceModel.findOne({
					resource_id: stat.resource_id,
				});
			}
			if (currentResource.resource_id != stat.resource_id) {
				currentResource = await this.resourceModel.findOne({
					resource_id: stat.resource_id,
				});
			}

			await this.submitSingleWork(stat, currentResource, user);
		}
	}

	async submitSingleWork(
		statsitics: LeanDocument<StatisticsDocument>,
		resource: LeanDocument<PartnerResource>,
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

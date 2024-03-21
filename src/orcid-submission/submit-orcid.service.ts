import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrcidClientService } from '../orcid-client/orcid-client.service';
import { InjectModel } from '@nestjs/mongoose';
import {
	Statistics,
	StatisticsDocument,
} from '../core/schemas/statistics.schema';
import { LeanDocument, Model } from 'mongoose';
import { User, UserDocument } from '../core/schemas/user.schema';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../core/schemas/resource/partner-resource.schema';
import { OrcidWorkBuilderToken } from './constants';
import { OrcidWorkBuilder } from './interfaces/orcid-submission.interface';
import { OrcidWork } from '../orcid-client/interfaces/orcid.interface';

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

		let currentResource = null;

		for await (const stat of stats) {
			const user = await this.userModel.findOne({
				orcid_id: stat.curator_orcid,
			});

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
			await this.orcidClientService.submitWork(user, work);
		} catch (err) {
			if (err instanceof Error) {
				this.logger.error('Error submitting work to ORCID');
				this.logger.error(err.message, err.stack, err.name);
			}
		}
	}
}

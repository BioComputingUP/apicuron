import { Injectable, Logger } from '@nestjs/common';
import { OrcidClientService } from '../../orcid-client/orcid-client.service';
import {
	Statistics,
	StatisticsDocument,
} from '../../core/schemas/statistics.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
	PartnerResource,
	PartnerResourceDocument,
} from '../../core/schemas/resource/partner-resource.schema';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from '../../core/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { PrivacyType } from '../../core/enums';
import { Cache } from '@nestjs/cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrcidSubmissionService {
	constructor(
		protected orcidClient: OrcidClientService,
		@InjectModel(PartnerResource.name)
		protected resourceModel: Model<PartnerResourceDocument>,
		@InjectModel(User.name) protected userModel: Model<UserDocument>,
		@InjectModel(Statistics.name)
		protected statModel: Model<StatisticsDocument>,
		protected config: ConfigService,
		protected cacheManager: Cache,
	) {
		this.frontendHost = config.get<string>('FRONTEND_HOST');
	}

	frontendHost: string;
	logger = new Logger(OrcidSubmissionService.name);

	async submitSingleStatistics(stat: StatisticsDocument) {
		const resource = await this.resourceModel.findOne({
			resource_id: stat.resource_id,
		});
		const user = await this.userModel.findOne({ orcid_id: stat.curator_orcid });

		if (!user) {
			return;
		}

		const putCode = await this.orcidClient.submitWork(user, {
			title: `Contributions to ${resource.resource_name}`,
			shortDescription: `Made ${stat.total_count} contributions.`,
			type: 'data-set',
			putCode: user.getResourcePutCode(stat.resource_id).putCode,
			externalIds: [
				{
					type: 'uri',
					value: 'APICURON Profile',
					url: new URL(
						`${this.frontendHost}curators/${user.orcid_id}#${resource.resource_name}`,
					),
					relationship: 'self',
				},
			],
		});

		user.setResourcePutCode(stat.resource_id, putCode);

		await user.save();

		return;
	}

	@Cron(CronExpression.EVERY_DAY_AT_2AM, { name: 'SubmitOrcidWorks' })
	async submitOrcidWorks(userFilter: FilterQuery<UserDocument>) {
		const users$ = this.userModel
			.find({
				$and: [
					userFilter,
					{
						privacy: PrivacyType.public,
						orcid_permission: { $exists: true },
					},
				],
			})
			.cursor({ batchSize: 50 });

		for await (const user of users$) {
			let workSubmissionCount = 0;

			const stats$ = this.statModel
				.find({
					curator_orcid: user.orcid_id,
					privacy: PrivacyType.public,
				})
				.cursor({ batchSize: 50 });

			for await (const stat of stats$) {
				const resource = await this.resourceModel.findOne({
					resource_id: stat.resource_id,
				});
				let putCode: string | null = null;
				try {
					putCode = await this.orcidClient.submitWork(user, {
						title: `Contributions to ${resource.resource_name}`,
						shortDescription: `Made ${stat.total_count} contributions.`,
						type: 'data-set',
						putCode: user.getResourcePutCode(stat.resource_id).putCode,
						externalIds: [
							{
								type: 'uri',
								value: 'APICURON Profile',
								url: new URL(
									`${this.frontendHost}curators/${user.orcid_id}#${resource.resource_name}`,
								),
								relationship: 'self',
							},
						],
					});
					user.setResourcePutCode(stat.resource_id, putCode);
					workSubmissionCount += 1;
				} catch (err) {
					if (err instanceof Error) {
						this.logger.error(
							`Failed to submit orcid works for user ${user.orcid_id} at the resource ${resource.resource_id}`,
						);
						this.logger.error(err.message, err.stack, err.name);
					}
				}
			}

			await user.save();

			this.logger.log(
				`Submitted ${workSubmissionCount} works for user ${user.orcid_id} `,
			);
		}
	}
}

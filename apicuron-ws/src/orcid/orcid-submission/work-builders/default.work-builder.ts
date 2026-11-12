import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LeanDocument } from 'mongoose';
import { ResourceCategory } from '../../../core/enums';
import { StatisticsDocument, UserDocument } from '../../../core/schemas';
import { PartnerResource } from '../../../core/schemas/resource/partner-resource.schema';
import { OrcidWork } from '../../../orcid/orcid-client/interfaces/orcid.interface';
import { OrcidWorkBuilder } from '../interfaces/orcid-submission.interface';
import {
	CreditedActivity,
	describeContributions,
} from './describe-contributions';

/** ORCID work type per resource category; anything not listed stays a data set. */
const WORK_TYPES: Partial<Record<ResourceCategory, string>> = {
	[ResourceCategory.Software]: 'software',
	[ResourceCategory.Training]: 'other',
};

export function workTypeFor(category: ResourceCategory | undefined): string {
	return (category && WORK_TYPES[category]) ?? 'data-set';
}

@Injectable()
export class DefaultWorkBuilder implements OrcidWorkBuilder {
	constructor(protected config: ConfigService) {
		this.frontendHost = this.config.getOrThrow<string>('FRONTEND_HOST');
	}

	frontendHost: string;
	buildWork(
		statsitics: LeanDocument<StatisticsDocument>,
		resource: LeanDocument<PartnerResource>,
		user: UserDocument,
		activities: CreditedActivity[] = [],
	): OrcidWork {
		const profileUrl = new URL(
			`${this.frontendHost}curators/${user.orcid_id}/${resource.resource_id}`,
		);

		const putCodeEntry = user.getResourcePutCode(resource.resource_id);

		const { putCode } = putCodeEntry ?? { putCode: undefined };
		return {
			externalIds: [
				{
					type: 'uri',
					value: `APICURON Profile for ${resource.resource_name}`,
					url: profileUrl,
					relationship: 'self',
				},
			],
			title: `Contributions to ${resource.resource_name}`,
			shortDescription: describeContributions({
				resourceName: resource.resource_name,
				firstContribution: statsitics.first_contribution,
				lastContribution: statsitics.last_contribution,
				totalCount: statsitics.total_count,
				activities,
			}),
			type: workTypeFor(resource.category),
			url: profileUrl,
			putCode: putCode,
		};
	}
}

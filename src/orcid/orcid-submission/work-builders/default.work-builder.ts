import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LeanDocument } from 'mongoose';
import { ConfigurationError, throwError } from 'src/util/error.utils';
import { PartnerResource } from '../../../core/schemas/resource/partner-resource.schema';
import { StatisticsDocument } from '../../../core/schemas/statistics.schema';
import { UserDocument } from '../../../core/schemas/user.schema';
import { OrcidWork } from '../../../orcid/orcid-client/interfaces/orcid.interface';
import { OrcidWorkBuilder } from '../interfaces/orcid-submission.interface';

@Injectable()
export class DefaultWorkBuilder implements OrcidWorkBuilder {
	constructor(protected config: ConfigService) {
		this.frontendHost =
			this.config.get<string>('FRONTEND_HOST') ??
			throwError(ConfigurationError, 'FRONTEND_HOST is not defined');
	}

	frontendHost: string;
	buildWork(
		statsitics: LeanDocument<StatisticsDocument>,
		resource: LeanDocument<PartnerResource>,
		user: UserDocument,
	): OrcidWork {
		const profileUrl = new URL(
			`${this.frontendHost}curators/${user.orcid_id}/${resource.resource_id}`,
		);

		const putCodeEntry = user.getResourcePutCode(resource.resource_id);

		const { putCode } = putCodeEntry ?? { putCode: null };
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
			shortDescription: `Completed ${statsitics.total_count} Activities that contribute to ${resource.resource_name}`,
			type: 'data-set',
			putCode: putCode ?? undefined,
		};
	}
}

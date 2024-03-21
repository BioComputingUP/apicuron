import { LeanDocument, Types, Document } from 'mongoose';
import { UserResourceEntity } from '../../core/schemas/components/user-resource-entity.schema';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { Statistics } from '../../core/schemas/statistics.schema';
import { User } from '../../core/schemas/user.schema';
import { OrcidWork } from '../../orcid-client/interfaces/orcid.interface';
import { OrcidWorkBuilder } from '../interfaces/orcid-submission.interface';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DefaultWorkBuilder implements OrcidWorkBuilder {
	constructor(protected config: ConfigService) {
		this.frontendHost = this.config.get<string>('FRONTEND_HOST');
	}

	frontendHost: string;
	buildWork(
		statsitics: LeanDocument<
			Statistics & UserResourceEntity & { _id: Types.ObjectId }
		>,
		resource: LeanDocument<PartnerResource>,
		user: Document<unknown, any, User> & User & { _id: Types.ObjectId },
	): OrcidWork {
		const profileUrl = new URL(
			`${this.frontendHost}curators/${user.orcid_id}#${resource.resource_name}`,
		);

		const { putCode } = user.getResourcePutCode(resource.resource_id);

		return {
			externalIds: [
				{
					type: 'uri',
					value: 'APICURON Profile',
					url: profileUrl,
					relationship: 'self',
				},
			],
			title: `Contributions to ${resource.resource_name}`,
			shortDescription: `Completed ${statsitics.total_count} Activities that contribute to ${resource.resource_name}`,
			type: 'data-set',
			putCode,
		};
	}
}

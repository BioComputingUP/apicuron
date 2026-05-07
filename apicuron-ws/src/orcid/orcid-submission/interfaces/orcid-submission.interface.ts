import { LeanDocument } from 'mongoose';
import { PartnerResource } from '../../../core/schemas/resource/partner-resource.schema';
import { StatisticsDocument } from '../../../core/schemas/statistics.schema';
import { UserDocument } from '../../../core/schemas/user.schema';
import { OrcidWork } from '../../../orcid/orcid-client/interfaces/orcid.interface';

export interface OrcidWorkBuilder {
	buildWork(
		statsitics: LeanDocument<StatisticsDocument>,
		resource: LeanDocument<PartnerResource>,
		user: UserDocument,
	): OrcidWork;
}

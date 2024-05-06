import { LeanDocument } from 'mongoose';
import { TermDocument } from '../../core/schemas/terms.schema';
import { PartnerResource } from '../../core/schemas/resource/partner-resource.schema';
import { BaseAggregationResult } from '../../report-aggregation/interfaces/aggregation-results';
import { UserDocument } from '../../core/schemas/user.schema';

export interface BaseReportIteratorResult {
	term: TermDocument | LeanDocument<TermDocument>;
	resource: PartnerResource | LeanDocument<PartnerResource>;
	report: BaseAggregationResult;
	user: UserDocument | LeanDocument<UserDocument>;
}

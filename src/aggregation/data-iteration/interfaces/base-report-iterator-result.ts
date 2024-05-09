import { LeanDocument } from 'mongoose';
import { TermDocument } from '../../../core/schemas/terms.schema';
import { PartnerResourceDocument } from '../../../core/schemas/resource/partner-resource.schema';
import { BaseAggregationResult } from '../../data-aggregation/interfaces/aggregation-results';
import { UserDocument } from '../../../core/schemas/user.schema';

export interface BaseReportIteratorResult<T = BaseAggregationResult> {
	term: TermDocument | LeanDocument<TermDocument>;
	resource: PartnerResourceDocument | LeanDocument<PartnerResourceDocument>;
	report: T;
	user: UserDocument | LeanDocument<UserDocument>;
}

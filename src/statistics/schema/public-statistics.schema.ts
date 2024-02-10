import { PrivacyType } from '../../core/enums';
import {
	Statistics,
	StatisticsAggregatedReportsFactory,
} from '../../core/schemas/statistics.schema';

export class PublicStatistics extends Statistics {}

export function PublicStatisticsFactory() {
	return StatisticsAggregatedReportsFactory({
		privacy: PrivacyType.public,
	});
}

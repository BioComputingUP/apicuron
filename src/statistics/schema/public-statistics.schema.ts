import { PrivacyType } from '../../core/schemas/activity-category.schema';
import {
	Statistics,
	StatisticsActivityCategoryFactory,
} from '../../core/schemas/statistics.schema';

export class PublicStatistics extends Statistics {}

export function PublicStatisticsFactory() {
	return StatisticsActivityCategoryFactory({
		privacy: PrivacyType.public,
	});
}

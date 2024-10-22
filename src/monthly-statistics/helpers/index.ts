import { FilterQuery } from 'mongoose';
import { MonthlyStatisticsDocument } from '../../core/schemas/statistics/monthly-statistics.schema';
import {
	LeanReportDocument,
	ReportDocument,
} from '../../core/schemas/reports.schema';
import { getMonthEnd, getMonthStart } from '../../util/date.helper';
import * as moment from 'moment-timezone';

export function getRelatedMonthlyStatFilter({
	resource_id,
	curator_orcid,
	timestamp,
	league,
}:
	| ReportDocument
	| LeanReportDocument): FilterQuery<MonthlyStatisticsDocument> {
	const momentInstance = moment(timestamp);
	return {
		resource_id,
		curator_orcid,
		league,
		monthStart: getMonthStart(momentInstance),
		monthEnd: getMonthEnd(momentInstance),
	};
}

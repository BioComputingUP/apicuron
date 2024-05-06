import { days, months } from '../constants';

export interface AggregateDaysResult {
	days: {
		[K in typeof days[number]]: number;
	};
}

export interface AggregateMonthsResult {
	months: {
		[K in typeof months[number]]: number;
	};
}

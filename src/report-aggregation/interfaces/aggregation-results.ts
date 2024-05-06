import {
	AggregateDaysResult,
	AggregateMonthsResult,
} from './operations-results';

export interface BaseAggregationResult {
	_id: {
		resource_id: string;
		curator_orcid: string;
		league: string;
		activity_term: string;
	};
	resource_id: string;
	curator_orcid: string;
	league: string;
	activity_term: string;
	count: number;
}

export interface DetailedAggregationResult
	extends AggregateDaysResult,
		AggregateMonthsResult {
	_id: {
		resource_id: string;
		curator_orcid: string;
		league: string;
		activity_term: string;
	};
	resource_id: string;
	curator_orcid: string;
	league: string;
	activity_term: string;
	count: number;
}

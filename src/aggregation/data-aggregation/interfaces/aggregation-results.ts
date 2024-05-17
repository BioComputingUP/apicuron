import { PrivacyType } from '../../../core/enums';
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
	last_contribution: Date;
	first_contribution: Date;
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
	last_contribution: Date;
	first_contribution: Date;
}

export interface AggregatedUserReportsByActivities {
	_id: string;
	activity_terms: string[];
	count: number;
	resource_id: string;
	league: string;
	privacy: PrivacyType;
	curator_orcid: string;
}

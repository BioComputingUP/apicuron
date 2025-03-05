import {
	PartnerResourceDocument,
	UserDocument,
	LeagueDocument,
	TermDocument,
} from '../../core/schemas';

export interface AggregatedReportsMonthly {
	resource_id: string;
	curator_orcid: string;
	league: string;
	activity_term: string;
	year: number;
	month: number;
	activity_category: string;
	count: number;
	score: number;
	total_score: number;
	privacy: string;
	first_contribution: Date;
	last_contribution: Date;
	resource: PartnerResourceDocument;
	user: UserDocument;
	league_data: LeagueDocument;
	term: TermDocument;
}

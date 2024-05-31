export type AggregatedReportsByActivities = {
	activity_terms: string[];
	count: number;
	resource_id: string;
	league: string;
	curator_orcid: string;
};

export type AggregatedReportsByMedalDef = AggregatedReportsByActivities & {
	score_total: number;
};

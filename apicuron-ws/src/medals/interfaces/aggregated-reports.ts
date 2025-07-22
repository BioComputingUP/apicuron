import { PrivacyType } from '../../core/enums';

/**
 * This is the output of an aggregation pipeline
 * it groups all reports related to a medal definition for a specific user
 */
export type MedalDefReportsUserSummary = {
	score_total: number;
	activity_terms: string[];
	count: number;
	resource_id: string;
	league: string;
	privacy: PrivacyType;
	curator_orcid: string;
};

import { InjectionToken } from '@angular/core';

export const ELEMENT_TOKEN = new InjectionToken<TableConfig>('ELEMENT_TOKEN');

export interface TableConfig {
	stat: {
		medals_count: number,
		badges_count: number,
		generation_count: number,
		invalidation_count: number,
		revision_count: number,
		total_score: number,
		last_contribution: Date,
	},
	user: {
		displayedName: string;
		orcid_id: string;
	}
}
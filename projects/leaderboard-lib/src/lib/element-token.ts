import { InjectionToken } from '@angular/core';

export const ELEMENT_TOKEN = new InjectionToken<TableConfig>('ELEMENT_TOKEN');

export interface TableConfig {
	medals_count: number,
	badges_count: number,
	generation_count: number,
	invalidation_count: number,
	revision_count: number,
	total_count: number,
	last_contribution: Date,
}
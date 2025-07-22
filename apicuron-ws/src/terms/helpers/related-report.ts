import { FilterQuery } from 'mongoose';
import {
	LeanTermDoc,
	TermDocument,
} from '../../core/schemas/terms.schema';
import { ReportDocument } from '../../core/schemas/reports.schema';

export function getRelatedReportFilter(
	term: TermDocument | LeanTermDoc,
): FilterQuery<ReportDocument> {
	return {
		resource_id: term.resource_id,
		league: term.league,
		activity_term: term.activity_term,
	};
}

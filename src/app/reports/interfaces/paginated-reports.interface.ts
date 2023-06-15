import { Report } from "src/app/models/report.model";
import { Term } from "src/app/models/term.model";


export interface PaginatedReports {
    data: Report[]
    total_count: number
    page: number,
    page_size: number
}

export interface PaginatedReportsWithTerms {
    data: { report: Report, term: Term}[],
    total_count: number,
    page: number,
    page_size: number
}
import { Report } from "src/app/models/report.model";


export interface GroupedReports {
    reports: Report[],
    groupKey: string | number,
    count?: number
}
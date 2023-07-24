import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { Paginated } from "src/app/interfaces/paginated";
import { Report } from "src/app/models/report.model";
import { GroupedReports } from "src/app/reports/interfaces/grouped-reports.interface";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { environment } from "src/environments/environment";

export type ReportsByResourceId = {
    [key: string]: Report[];
  };
  

@Injectable()
export class ReportsService {

    constructor(protected http: HttpClient) { }

    ws = environment.ws + '/'

    getReports(reportFilter: ReportFilter): Observable<Paginated<Report>> {
        const url = new URL(`reports`, this.ws).href

        const httpParams = new HttpParams({ fromObject: reportFilter.serialize() })
        return this.http.get(url, {
            headers: {
                version: "2"
            },
            params: httpParams
        }).pipe(
            map((response: Paginated<Report>) => {
                response.data = response.data.map((report) => new Report().deserialize(report))
                return response;
            })
        )
    }

    groupReportsByResourceId(reports$: Observable<Paginated<Report>>): Observable<ReportsByResourceId> {
        return reports$.pipe(
            // split the data based on the resource
            map((reportsData: Paginated<Report>) => {
                return reportsData.data.reduce((acc, report) => {
                    if (!acc[report.resource_id]) {
                        acc[report.resource_id] = [report]
                    } else {
                        acc[report.resource_id].push(report)
                    }

                    return acc;
                }, {})
            })
        )
    }

    getGrouppedReports(reportFilter: ReportFilter, groupBy: 'day' | 'month' | 'activity_term'): Observable<Paginated<GroupedReports>> {
        const url: string = new URL(`reports/group-by/${groupBy}`, this.ws).href

        const httpParams = new HttpParams({ fromObject: reportFilter.serialize() })
        return this.http.get<Paginated<GroupedReports>>(url, {
            headers: {
                version: '2'
            },
            params: httpParams
        })
    }

}
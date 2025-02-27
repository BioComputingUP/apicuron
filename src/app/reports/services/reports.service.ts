import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { combineLatest, Observable } from "rxjs";
import { map, shareReplay } from "rxjs/operators";
import { Paginated } from "src/app/interfaces/paginated";
import { Report } from "src/app/models/report.model";
import { GroupedReports } from "src/app/reports/interfaces/grouped-reports.interface";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { environment } from "src/environments/environment";
import { Term } from "../../models/term.model";

export type ReportsByResourceId = {
  [key: string]: Report[];
};

@Injectable()
export class ReportsService {
  constructor(protected http: HttpClient) { }

  ws = environment.ws + "/";

  getReports(reportFilter: ReportFilter): Observable<Paginated<Report>> {
    const url = new URL(`reports`, this.ws).href;

    const httpParams = new HttpParams({ fromObject: reportFilter.serialize() });
    return this.http
      .get(url, {
        headers: {
          version: "2",
        },
        params: httpParams,
      })
      .pipe(
        map((response: Paginated<Report>) => {
          response.data = response.data.map((report) =>
            new Report().deserialize(report)
          );
          return response;
        })
      );
  }

  getReportsCombineWithTerms(
    reportFilter: ReportFilter,
    terms: Observable<Term[]>
  ): Observable<Paginated<Report>> {
    return combineLatest([this.getReports(reportFilter), terms]).pipe(
      map(([reports, terms]) => {
        reports.data = reports.data.map((report) => {
          report.term = terms.find((term) => term.matchesReport(report));
          if (!report.term) {
            throw new Error(
              `Passed Term in terms Array missing for activity_term ${report.activity_term}`
            );
          }
          return report;
        });
        return reports;
      })
    );
  }

  groupReportsByResourceId(
    reports$: Observable<Paginated<Report>>
  ): Observable<ReportsByResourceId> {
    return reports$.pipe(
      // split the data based on the resource
      map((reportsData: Paginated<Report>) => {
        return reportsData.data.reduce((acc, report) => {
          if (!acc[report.resource_id]) {
            acc[report.resource_id] = [report];
          } else {
            acc[report.resource_id].push(report);
          }

          return acc;
        }, {});
      })
    );
  }

}

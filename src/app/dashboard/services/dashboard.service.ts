import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { Report, ReportFilter, ReportStatistics } from "../../models/Report.model";
import { report } from "process";
import { map, pluck } from "rxjs/operators";

const baseHeaders = {
  version: "2"
}


@Injectable()
export class DashboardService {
  constructor(protected http: HttpClient) {}

  submit_report(report: Report): Observable<any> {
    return this.http.post(environment.ws + "/reports/single", report, {
      headers: baseHeaders,
    });
  }

  submit_reports_bulk(form_data: FormData) {
    return this.http.post(environment.ws + "/reports/bulk", form_data, {
      headers: baseHeaders,
    });
  }

  get_report_statistics(reportFilter: ReportFilter){
    return this.http.get(environment.ws + '/reports/statistics', {
      headers: baseHeaders,
      params: new HttpParams({ fromObject: ReportFilter.serialize(reportFilter) })
    }).pipe(
      pluck('data'),
      map((data: any[]) => {
        return data.map(x => {
          return new ReportStatistics().deserialize(x)
        })
      })

    )
  }
}

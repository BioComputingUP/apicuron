import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";

export type Report = {
  resource_id: string;
  activity_term: string;
  curator_orcid: string;
  timestamp: Date;
  entity_uri: string;
};

@Injectable()
export class DashboardService {
  constructor(protected http: HttpClient) {}

  submit_report(report: Report): Observable<any> {
    return this.http.post(environment.ws + "/reports/single", report, {
      headers: {
        version: "2",
      },
    });
  }

  submit_reports_bulk(form_data: FormData) {
    return this.http.post(environment.ws + "/reports", form_data, {
      headers: {
        version: "2",
      },
    });
  }
}

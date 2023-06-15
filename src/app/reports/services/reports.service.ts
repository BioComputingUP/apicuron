import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Report } from "src/app/models/report.model";
import { PaginatedReports } from "src/app/reports/interfaces/paginated-reports.interface";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { environment } from "src/environments/environment";



@Injectable()
export class ReportsService {

    constructor(protected http: HttpClient) {}

    ws = environment.ws +'/'
    
    getReports( reportFilter: ReportFilter): Observable<PaginatedReports>{
        const url = new URL(`reports`, this.ws).href

        const httpParams = new HttpParams({ fromObject: reportFilter.serialize() })
        return this.http.get(url, {
            headers: {
                version: "2"
            },
            params: httpParams
        }).pipe(
            map((response: PaginatedReports) => {
                response.data = response.data.map((report) => new Report().deserialize(report))
                return response;
            })
        )
    }

}
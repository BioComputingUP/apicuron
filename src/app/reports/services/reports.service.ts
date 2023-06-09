import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ReportFilter } from "src/app/reports/interfaces/report-filter.interface";
import { environment } from "src/environments/environment";



@Injectable()
export class ReportsService {

    constructor(protected http: HttpClient) {}

    ws = environment.ws +'/'
    
    getReports( reportFilter: ReportFilter){
        const url = new URL(`reports`, this.ws).href
        return this.http.get(url, {
            headers: {
                version: "2"
            }
        })
    }

}
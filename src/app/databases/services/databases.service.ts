import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

import { environment } from "../../../environments/environment";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DatabasesService {
  constructor(private http: HttpClient) {}
  private apicuronResources = environment.ws + "/partner-resources";

  GetResources() {
    const data = this.http.get(this.apicuronResources, {
      responseType: "json",
      headers: {
        version: "2",
      },
    });
    return data;
    // .pipe(catchError(err => of(console.error(err))));
  }


  get_resource_details(resource_id: string){
    const response = this.http.get(`${this.apicuronResources}/${resource_id}`, {
      responseType: 'json',
      headers: {
        version: '2'
      },
      
    })
    return response
  }

  get_resource_leaderboard(resource_id: string){
    

    const response = this.http.get(`${environment.ws}/statistics/leaderboard/${resource_id}`, {
      responseType: 'json',
      headers: {
        version: '2'
      },
      params: {
        page_size: '20'
      }
    })
    return response
  }
}

import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class CuratorService {
  private wsUrl = environment.ws;
  private orcid_url = environment.orcid_url;

  constructor(private http: HttpClient) {}

  search_curators(params: HttpParams) {
    return this.http.get(this.wsUrl + "/statistics", {
      params,
      headers: {
        version: "2",
      },
    });
  }


  

  
}

import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

import { environment } from "../../../environments/environment";
import { AuthService } from "../../auth/auth.service";

@Injectable({
  providedIn: "root",
})
export class DatabasesService {
  constructor(private http: HttpClient, private auth: AuthService) {}
  private partnerResourcesPath = environment.ws + "/partner-resources";
  private resourcesPath = environment.ws + "/resources";

  get_resources() {
    const data = this.http.get(this.partnerResourcesPath, {
      responseType: "json",
      headers: {
        version: "2",
      },
    });
    return data;
    // .pipe(catchError(err => of(console.error(err))));
  }

  create_resource(resource_data: Object) {
    const data = this.http.put(
      this.resourcesPath,
      resource_data,
      {
        responseType: "json",
        headers: {
          version: "2",
        },
      }
    );
    return data
  }

  update_resource(resource_data: Object){
    const data = this.http.put(
      this.partnerResourcesPath + '/update',
      resource_data,
      {
        responseType: 'json',
        headers: {
          version: '2',
          authorization: this.auth.token_value
        }
      }
    )

    return data
  }

  get_resource_details(resource_id: string) {
    const response = this.http.get(
      `${this.partnerResourcesPath}/${resource_id}`,
      {
        responseType: "json",
        headers: {
          version: "2",
        },
      }
    );
    return response;
  }

  get_resource_leaderboard(resource_id: string) {
    const response = this.http.get(
      `${environment.ws}/statistics/leaderboard/${resource_id}`,
      {
        responseType: "json",
        headers: {
          version: "2",
        },
        params: {
          page_size: "20",
        },
      }
    );
    return response;
  }
}

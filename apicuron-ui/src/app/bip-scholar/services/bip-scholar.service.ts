import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, shareReplay, switchMap } from "rxjs";
import {
  BipScholarSection,
  BipScholarStats,
} from "src/app/models/external/bip-scholar.model";
import { environment } from "src/environments/environment";

@Injectable()
export class BipScholarService {
  private bip_scholar_api_url = environment.bip_scholar_api_url;
  private stage = environment.env;
  bip_stats$: Observable<any>;
  constructor(private http: HttpClient) {}
  init(orcid_id$: Observable<string>) {
    this.bip_stats$ = this.getBipScholarScores(orcid_id$);
  }

  getBipScholarScores(
    orcid$: Observable<string>
  ): Observable<Array<{ key: string; value: BipScholarSection }>> {
    if (this.stage === "development") {
      // Avoid calling the service in dev environment
      return new Observable((observer) => {
        observer.next(null);
        observer.complete();
      });
    }
    return orcid$.pipe(
      switchMap((orcid: string) => {
        let query_orcid = this.stage == "local" ? "0000-0003-0555-4128" : orcid;
        return this.http.get(this.bip_scholar_api_url + `/${query_orcid}`, {
          headers: {
            accept: "application/json",
          },
        });
      }),
      map((response: any) => {
        if (!response || Object.keys(response).length === 0) {
          return null; // Return null if no data is available
        }
        const bipScholarStats = new BipScholarStats()
          .deserialize(response)
          .statCardViewModel();
        return bipScholarStats;
      }),
      shareReplay(1)
    );
  }
}

import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, ParamMap, Params } from "@angular/router";
import {
  BehaviorSubject,
  combineLatest,
  forkJoin,
  Observable,
  ReplaySubject,
  Subject,
  zip,
} from "rxjs";
import {
  filter,
  map,
  pluck,
  shareReplay,
  switchMap,
  tap,
} from "rxjs/operators";
import { environment } from "../../../environments/environment";

export interface CuratorAchievements {
  medals?: [any];
  badges?: [any];
}
export interface CuratorStat extends CuratorAchievements {
  generation_count: number;
  revision_count: number;
  invalidation_count: number;
  badges_count: number;
  medals_count: number;
  resource_id: string;
}

export interface Curator {
  displayedName: string;
  orcid_id: string;
  stats: [CuratorStat];
}

export interface OrcidData {
  keywords?: [string];
  biography?: string;
  social_urls?: [[string, string]];
}

@Injectable()
export class CuratorPageService {
  private wsUrl = environment.ws;
  private orcid_url = environment.orcid_url;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  get_curator(orcid_id: string) {
    return this.http
      .get<{ data: Curator }>(this.wsUrl + "/users/" + orcid_id, {
        headers: {
          version: "2",
        },
      })
      .pipe(pluck("data"));
  }

  get_curator_orcid_details(orcid_id: string) {
    return this.http
      .get(this.orcid_url + orcid_id, {
        headers: {
          Accept: "application/json",
        },
      })
      .pipe(
        map((response) => {
          const keywords = response["person"]?.["keywords"]?.["keyword"]?.map(
            (x: string) => x["content"].trim()
          );
          const biography = response["person"]?.["biography"]?.["content"];
          const social_urls = response["person"]?.["researcher-urls"]?.[
            "researcher-url"
          ]?.map((x) => [x?.["url-name"], x?.["url"]?.["value"]]);
          return {
            keywords,
            biography,
            social_urls,
          };
        })
      );
  }

  get_achievements(orcid_id: string, resource_id: string) {
    return this.http
      .get(this.wsUrl + `/achievements/${orcid_id}/${resource_id}`, {
        headers: {
          version: "2",
        },
      })
      .pipe(pluck("data"));
  }

  get_reports(httpParams: HttpParams) {
    return this.http.get(this.wsUrl + `/reports`, {
      headers: {
        version: '2'
      },
      params: httpParams
    })
  }

  curator_statistics(orcid_id: string){
    return this.http.get(this.wsUrl + '/statistics/user/' + orcid_id, {
      headers: {
        version: '2'
      }
    })
  }
}

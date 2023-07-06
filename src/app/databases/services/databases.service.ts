import { Injectable } from "@angular/core";
import { combineLatest, Observable } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

import { environment } from "../../../environments/environment";
import { AuthService } from "../../auth/auth.service";
import { catchError, map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { Term } from "../../models/term.model";
import { BadgeDef } from "../../models/badge-def.model";
import { Medal } from "../../models/medal.model";
import { Resource } from "../../models/resource.model";

type ResourceList = {
  data: Array<Resource>;
  warning?: Array<string> | string;
  count?: number;
};

@Injectable({
  providedIn: "root",
})
export class DatabasesService {
  resources_list$: Observable<ResourceList>;
  constructor(private http: HttpClient) {
    this.resources_list$ = this.http
      .get<ResourceList>(this.partnerResourcesPath, {
        responseType: "json",
        headers: {
          version: "2",
        },
      })
      .pipe(shareReplay());
  }
  private partnerResourcesPath = environment.ws + "/partner-resources";
  private resourcesPath = environment.ws + "/resources";
  private termsPath = environment.ws + "/terms";

  get_resources() {
    return this.resources_list$;
  }

  create_resource(resource_data: Object) {
    const data = this.http.put(this.resourcesPath, resource_data, {
      responseType: "json",
      headers: {
        version: "2",
      },
    });
    return data;
  }

  update_resource(resource_data: Object) {
    const data = this.http.put(this.partnerResourcesPath, resource_data, {
      responseType: "json",
      headers: {
        version: "2",
      },
    });

    return data;
  }

  get_resource_details(resource_id: string) {
    const resource$: Observable<Object> = this.http
      .get(`${this.partnerResourcesPath}/${resource_id}`, {
        responseType: "json",
        headers: {
          version: "2",
        },
      })
      .pipe(pluck("data"));
    const terms$: Observable<Term[]> = this.http
      .get(this.termsPath, {
        headers: {
          version: "2",
        },
        params: {
          resource_id,
        },
      })
      .pipe(
        pluck("data"),
        map((data: Term[]) => data.map((term) => new Term().deserialize(term))),
        map(Term.computeTermScoreQuartile)
      );

    // @ts-ignore
    const medals$: Observable<Object> = this.http
      .get(environment.ws + "/achievements-def/medals", {
        headers: {
          version: "2",
        },
        params: {
          resource_id,
        },
      })
      .pipe(
        pluck("data"),
        map((medals: any[]) =>
          medals.map((medal) => new Medal().deserialize(medal))
        )
      );

    const badges$: Observable<Object> = this.http
      .get(environment.ws + "/achievements-def/badges", {
        headers: {
          version: "2",
        },
        params: {
          resource_id,
        },
      })
      .pipe(
        pluck("data"),
        map((badges: BadgeDef[]) => {
          return badges.map((badge) => new BadgeDef().deserialize(badge));
        })
      );

    return combineLatest([badges$, medals$, terms$, resource$]).pipe(
      map(([badges, medals, terms, resource]) => {
        return {
          badges,
          medals,
          terms,
          ...resource,
        };
      })
    );
  }

  get_resource(resource_id: string): Observable<{ data: Resource}> {
    const response = this.http.get<{ data: Resource }>(
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
          limit: "20",
        },
      }
    );
    return response;
  }
}

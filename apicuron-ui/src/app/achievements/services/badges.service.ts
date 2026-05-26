import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, pluck } from "rxjs/operators";
import {
  AchievementFilter,
  MyBadgesFilter,
} from "src/app/achievements/interfaces/achievement-filter";
import { Paginated } from "src/app/interfaces/paginated";
import { Badge } from "src/app/models/badge.model";
import { environment } from "src/environments/environment";

@Injectable()
export class BadgesService {
  constructor(protected http: HttpClient) { }

  wsUrl = environment.ws + "/achievements";

  getBadges(params: AchievementFilter): Observable<Paginated<Badge>> {
    const url = this.wsUrl + "/badges";

    const httpParams = new HttpParams({ fromObject: params.serialize() });
    return this.http
      .get(url, {
        headers: {
          version: "2",
        },
        params: httpParams,
      })
      .pipe(
        // Deserialize medals
        map((badges: Paginated<Badge>) => {
          const { data } = badges;
          badges.data = data.map((badge: Badge) =>
            new Badge().deserialize(badge)
          );
          return badges;
        })
      );
  }

  getMyBadges(filter: MyBadgesFilter) {
    return this.http
      .get(`${this.wsUrl}/my-badges`, {
        params: filter.serialize(),
        headers: {
          Version: "2",
        },
      })
      .pipe(
        map((response: Paginated<Badge>) => {
          response.data = response.data.map((badge: Badge) =>
            new Badge().deserialize(badge)
          );
          return response as Paginated<Badge>;
        })
      );
  }
}

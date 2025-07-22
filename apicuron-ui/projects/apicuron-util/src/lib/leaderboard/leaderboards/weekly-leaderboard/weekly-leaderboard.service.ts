import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Paginated } from "../../../../../../../src/app/interfaces/paginated";
import { environment } from "../../../../../../../src/environments/environment";
import {
  LeaderboardFilter,
  WeeklyLeaderboardEntry,
} from "./weekly-leaderboard.entry";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { ILeaderboardService } from "../../interfaces/leaderboard-service";

@Injectable()
export class WeeklyLeaderboardService
  implements ILeaderboardService<LeaderboardFilter, WeeklyLeaderboardEntry>
{
  constructor(private http: HttpClient) {}
  getResourceLeaderboard(
    filter: LeaderboardFilter
  ): Observable<Paginated<WeeklyLeaderboardEntry>> {
    const response$ = this.http
      .get(
        `${environment.ws}/weekly-statistics/${filter.resource_id}/leaderboard`,
        {
          responseType: "json",
          headers: {
            version: "2",
          },
          params: {
            skip: filter.skip.toString(),
            limit: filter.limit.toString(),
          },
        }
      )
      .pipe(
        map(({ data, meta }: Paginated<WeeklyLeaderboardEntry>) => {
          return {
            data: data.map((stat: WeeklyLeaderboardEntry) =>
              new WeeklyLeaderboardEntry().deserialize(stat)
            ),
            meta,
          };
        })
      );
    return response$;
  }
}

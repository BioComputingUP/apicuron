import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Paginated } from "../../../../../../../src/app/interfaces/paginated";
import { environment } from "../../../../../../../src/environments/environment";
import {
  LeaderboardFilter,
  MonthlyLeaderboardEntry,
} from "./monthly-leaderboard.entry";
import { map } from "rxjs/operators";
import { Injectable } from "@angular/core";
import { ILeaderboardService } from "../../interfaces/leaderboard-service";

@Injectable()
export class MonthlyLeaderboardService
  implements ILeaderboardService<LeaderboardFilter, MonthlyLeaderboardEntry>
{
  constructor(private http: HttpClient) {}
  getResourceLeaderboard(
    filter: LeaderboardFilter
  ): Observable<Paginated<MonthlyLeaderboardEntry>> {
    const response$ = this.http
      .get(
        `${environment.ws}/monthly-statistics/${filter.resource_id}/leaderboard`,
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
        map(({ data, meta }: Paginated<MonthlyLeaderboardEntry>) => {
          return {
            data: data.map((stat: MonthlyLeaderboardEntry) =>
              new MonthlyLeaderboardEntry().deserialize(stat)
            ),
            meta,
          };
        })
      );
    return response$;
  }
}

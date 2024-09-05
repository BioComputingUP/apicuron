import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map, pluck, skip, switchMap } from "rxjs/operators";
import { Paginated } from "src/app/interfaces/paginated";
import { User } from "src/app/models/User.model";
import { WeeklyCuratorStatistics } from "src/app/models/statistics.model";
import { environment } from "src/environments/environment";
import { LeaderboardFilter } from "../interfaces/leaderboard-filter";
import {
  LeaderboardEntry,
  WeeklyLeaderboardEntry,
} from "../interfaces/leaderboard-entry";

@Injectable({
  providedIn: "root",
})
export class LeaderboardService {
  constructor(protected http: HttpClient) {}
  ws = environment.ws;
  partnerResourcesPath = environment.ws + "/partner-resources";

  private leaderboardColumns = {
    medals_count: { name: "Medals" },
    badges_count: { name: "Badges" },
    generation_count: { name: "Generation Contributions" },
    invalidation_count: { name: "Invalidation Contributions" },
    revision_count: { name: "Revision Contributions" },
    generation_score: { name: "Generation Score" },
    invalidation_score: { name: "Invalidation Score" },
    revision_score: { name: "Revision Score" },
    total_score: { name: "Total Score" },
    total_count: { name: "Total Contributions" },
    last_contribution: { name: "Last Contribution Date" },
    daysOfWeek: { name: "Weekly Contribution" },
  };

  getColumnProps(col: string) {
    return this.leaderboardColumns[col];
  }

  getUserData(orcid_id: string) {
    return this.http
      .get(this.ws + "/users/" + orcid_id, {
        headers: {
          version: "2",
        },
      })
      .pipe(pluck("data"));
  }

  getUser(orcid_id: string): Observable<User> {
    return this.getUserData(orcid_id).pipe(
      map((response) => {
        const user = new User().deserialize(response);
        return user;
      })
    );
  }

  getResourceLeaderboard(
    filter: LeaderboardFilter
  ): Observable<Paginated<LeaderboardEntry>> {
    const url = `${environment.ws}/statistics/${filter.resource_id}/leaderboard`;
    return this.http
      .get<Paginated<LeaderboardEntry>>(url, {
        responseType: "json",
        headers: { version: "2" },
        params: {
          skip: filter.skip.toString(),
          limit: filter.limit.toString(),
        },
      })
      .pipe(
        map((response: Paginated<LeaderboardEntry>) => {
          response.data = response.data.map((stat: LeaderboardEntry) =>
            new LeaderboardEntry().deserialize(stat)
          );
          return response as Paginated<LeaderboardEntry>;
        })
      );
  }

  // getResourceLeaderboardWithUsers(
  //   filter: LeaderboardFilter
  // ): Observable<Paginated<{ user: User; stat: LeaderboardEntry }>> {
  //   return this.getResourceLeaderboard(filter).pipe(
  //     switchMap((stats: Paginated<LeaderboardEntry>) => {
  //       const statList = stats.data;
  //       const orcidIds = statList.map(({ curator_orcid }) => curator_orcid);
  //       const usersList$ = orcidIds.map((id) => this.getUser(id));
  //       return combineLatest(usersList$).pipe(
  //         map((users: User[]) => {
  //           const data = statList.map((stat, index) => {
  //             const user = users.find(
  //               (user) => user.orcid_id == stat.curator_orcid
  //             );
  //             stat.ranking = index + 1 + filter.skip;
  //             return { user, stat };
  //           });
  //           return {
  //             data,
  //             meta: stats.meta,
  //           };
  //         })
  //       );
  //     })
  //   );
  // }

  getWeeklyResourceLeaderboard(
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

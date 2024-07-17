import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map, pluck, switchMap } from "rxjs/operators";
import { Paginated } from "src/app/interfaces/paginated";
import { BaseCuratorStatistics, CuratorStatistics, WeeklyCuratorStatistics } from "src/app/models/statistics.model";
import { environment } from "src/environments/environment";
import { StatisticsFilter } from "../models/statistics-filter";
import { CuratorWithStats } from "../models/curator-stats";
import { User } from "src/app/models/User.model";

@Injectable()
export class CuratorStatisticsService {
  constructor(protected http: HttpClient) {}
  ws = environment.ws;

  get_curator_statistics(orcid_id: string) {
    return this.http
      .get(this.ws + "/statistics/user/" + orcid_id, {
        headers: {
          version: "2",
        },
      })
      .pipe(
        pluck("data"),
        map((data: CuratorStatistics[]) => {
          return data.map((stat: CuratorStatistics) =>
            new CuratorStatistics().deserialize(stat)
          );
        })
      );
  }

  getUserData(orcid_id: string) {
    return this.http
      .get(this.ws + "/users/" + orcid_id, {
        headers: {
          version: "2",
        },
      })
      .pipe(
        pluck("data")
      );
  }

  getUser(orcid_id: string): Observable<User> {
    return this.getUserData(orcid_id).pipe(
      map((response) => {
        const user = new User().deserialize(response);
        return user;
      })
    )
  }

  getResourceLeaderboard(
    resource_id: string,
    limit: number = 10,
    skip: number = 0
  ): Observable<Paginated<BaseCuratorStatistics>> {
    const url = `${environment.ws}/statistics/leaderboard/${resource_id}`;
    return this.http
      .get<Paginated<BaseCuratorStatistics>>(url, {
        responseType: "json",
        headers: {
          version: "2",
        },
        params: {
          limit,
          skip,
        },
      })
      .pipe(
        map((response: Paginated<BaseCuratorStatistics>) => {
          response.data = response.data.map((stat: BaseCuratorStatistics) =>
            new BaseCuratorStatistics().deserialize(stat)
          );
          return response;
        })
      );
  }  

  getResourceLeaderboardWithUsers(resource_id: string): Observable<{ user: User, stat: BaseCuratorStatistics }[]> {
    return this.getResourceLeaderboard(resource_id).pipe(
      switchMap((stats: Paginated<BaseCuratorStatistics>) => {
        const statList = stats.data;
        const orcidIds = statList.map(({ curator_orcid }) => curator_orcid);
        const usersList$ = orcidIds.map((id) => this.getUser(id));
        return combineLatest(usersList$).pipe(
          map((users: User[]) => {
            return statList.map((stat, index) => {
              const user = users[index];
              stat.ranking = index + 1;
              return { user, stat };
            });
          })
        );
      })
    );
  }

  getWeeklyResourceLeaderboard(
    resource_id: string,
    limit: number = 10,
    skip: number = 0
  ): Observable<Paginated<WeeklyCuratorStatistics>> {
    const response$ = this.http
      .get(`${environment.ws}/weekly-statistics/${resource_id}/leaderboard`, {
        responseType: "json",
        headers: {
          version: "2",
        },
        params: {
          limit,
          skip,
        },
      })
      .pipe(
        map(({ data, meta }: Paginated<WeeklyCuratorStatistics>) => {
          return {
            data: data.map((stat: WeeklyCuratorStatistics) =>
              new WeeklyCuratorStatistics().deserialize(stat)
            ),
            meta,
          };
        })
      );
    return response$;
  }

  // getWeeklyResourceLeaderboardWithUsers(resource_id: string) { 
  //   const stats$ = this.getWeeklyResourceLeaderboard(resource_id)
  //   const result$ = stats$.pipe(
  //     switchMap((stats: Paginated<WeeklyCuratorStatistics>) => {
  //       const statList = stats.data;
  //       const orcidIds = statList.map(({ curator_orcid }) => curator_orcid);
  //       const usersList$ = orcidIds.map((id) => this.getUser(id));
  //       const users$ = combineLatest(usersList$);
  //       const result = combineLatest([users$, of(stats)]);
  //       return result
  //     }),
  //     map(([user, stat]) => {
  //       return { user, stat };
  //     })
  //   )
  //   return result$;
  // }

  getWeeklyResourceLeaderboardWithUsers(resource_id: string): Observable<{ user: User, stat: WeeklyCuratorStatistics }[]> {
    return this.getWeeklyResourceLeaderboard(resource_id).pipe(
      switchMap((stats: Paginated<WeeklyCuratorStatistics>) => {
        const statList = stats.data;
        const orcidIds = statList.map(({ curator_orcid }) => curator_orcid);
        const usersList$ = orcidIds.map((id) => this.getUser(id));
        return combineLatest(usersList$).pipe(
          map((users: User[]) => {
            return statList.map((stat, index) => {
              const user = users[index];
              stat.ranking = index + 1;
              return { user, stat };
            });
          })
        );
      })
    );
  }  

  getStatistics(
    statFilter: StatisticsFilter
  ): Observable<Paginated<CuratorWithStats>> {
    const url = this.ws + "/statistics";
    return this.http
      .get(url, {
        headers: {
          version: "2",
        },
        params: statFilter.serialize(),
      })
      .pipe(
        map((response: Paginated<CuratorWithStats>) => {
          response.data = response.data.map((curatorWithStats) =>
            new CuratorWithStats().deserialize(curatorWithStats)
          );
          return response;
        })
      );
  }

  getWeeklyStatistics(
    resource_id: string,
    curator_orcid: string,
    league: string,
    statFilter: StatisticsFilter
  ): Observable<Paginated<CuratorWithStats>> {
    const url = `${this.ws}/weekly-statistics/${resource_id}/${curator_orcid}/${league}`;
    return this.http
      .get(url, {
        headers: {
          version: "2",
        },
        params: statFilter.serialize(),
      })
      .pipe(
        map((response: Paginated<CuratorWithStats>) => {
          response.data = response.data.map((curatorWithStats) =>
            new CuratorWithStats().deserialize(curatorWithStats)
          );
          return response;
        })
      );
    }
}

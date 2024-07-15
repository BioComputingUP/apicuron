import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { catchError, map, pluck, tap } from "rxjs/operators";
import { Paginated } from "src/app/interfaces/paginated";
import { CuratorStatistics, WeeklyCuratorStatistics } from "src/app/models/statistics.model";
import { environment } from "src/environments/environment";
import { StatisticsFilter } from "../models/statistics-filter";
import { CuratorWithStats } from "../models/curator-stats";

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

  get_resource_statistics(resource_id: string) {
    throw new Error("Not Implemented Error !");
  }

  getResourceLeaderboard(
    resource_id: string,
    limit: number = 10,
    skip: number = 0
  ): Observable<Paginated<CuratorStatistics>> {
    const response$ = this.http
      .get(`${environment.ws}/statistics/leaderboard/${resource_id}`, {
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
        map(({ data, meta }: Paginated<CuratorStatistics>) => {
          return {
            data: data.map((stat: CuratorStatistics) =>
              new CuratorStatistics().deserialize(stat)
            ),
            meta,
          };
        })
      );
    return response$;
  }

  // getResourceLeaderboard(
  //   resource_id: string,
  //   limit: number = 10,
  //   skip: number = 0
  // ): Observable<Paginated<CuratorWithStats>> {
  //   const url = `${environment.ws}/statistics/leaderboard/${resource_id}`;
  //   return this.http
  //     .get<Paginated<CuratorWithStats>>(url, {
  //       responseType: "json",
  //       headers: {
  //         version: "2",
  //       },
  //       params: {
  //         limit,
  //         skip,
  //       },
  //     })
  //     .pipe(
  //       map((response: Paginated<CuratorWithStats>) => {
  //         response.data = response.data.map((stat: CuratorWithStats) =>
  //           new CuratorWithStats().deserialize(stat)
  //         );
  //         return response;
  //       })
  //     );
  // }  

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

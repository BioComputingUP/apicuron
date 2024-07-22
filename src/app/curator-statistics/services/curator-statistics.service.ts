import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, combineLatest, of } from "rxjs";
import { map, pluck, switchMap, tap } from "rxjs/operators";
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

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LeaderboardFilter } from './interfaces/leaderboard-filter';
import { Observable } from 'rxjs';
import { Paginated } from 'src/app/interfaces/paginated';
import { LeaderboardEntry } from './interfaces/leaderboard-entry';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardLibService {
  webserverUrl = environment.ws;

  constructor(protected http: HttpClient) {}

  getResourceLeaderboard(filter: LeaderboardFilter): Observable<Paginated<LeaderboardEntry>> {
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
}

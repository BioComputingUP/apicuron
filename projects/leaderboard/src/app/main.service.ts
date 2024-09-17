import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map, pluck } from "rxjs/operators";
import { Paginated } from "../../../../src/app/interfaces/paginated";
import { CuratorStatistics } from "../../../../src/app/models/statistics.model";
import { Resource } from "../../../../src/app/models/resource.model";
import { User } from "../../../../src/app/models/User.model";
import { environment } from "../../../../src/environments/environment";
import { LeaderboardEntry } from "./models/leaderboard.model";
import { Observable } from "rxjs";
import { LeaderboardFilter } from "../../../../src/app/databases/interfaces/leaderboard-filter";



@Injectable()
export class MainService {


    constructor(protected http: HttpClient) { }

    webserverUrl= environment.ws;
    

    

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

    getResource(resource_id: string) {
        const response = this.http.get(
            `${this.webserverUrl}/partner-resources/${resource_id}`,
            {
                responseType: "json",
                headers: {
                    version: "2",
                },
            }
        );
        return response.pipe(
            pluck("data"),
            map((resource: Resource) => {
                return new Resource().deserialize(resource);
            })
        );
    }


    getCurator(orcid_id: string) {
        return this.http.get<{ data: User }>(this.webserverUrl + "/users/" + orcid_id, {
            headers: {
                version: "2",
            },
        }).pipe(
            pluck('data'),
            map((data: User) => {
                return new User().deserialize(data)
            })
        )
    }
}

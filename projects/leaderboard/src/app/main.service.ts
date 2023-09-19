import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { map, pluck } from "rxjs/operators";
import { Paginated } from "../../../../src/app/interfaces/paginated";
import { CuratorStatistics } from "../../../../src/app/models/statistics.model";
import { Resource } from "../../../../src/app/models/resource.model";
import { User } from "../../../../src/app/models/User.model";
import { environment } from "../../../../src/environments/environment";



@Injectable()
export class MainService {


    constructor(protected http: HttpClient) { }

    webserverUrl= environment.ws;

    getResourceLeaderboard(resource_id: string, limit: number = 10, skip: number = 0) {
        const response$ = this.http.get(
            `${this.webserverUrl}/statistics/leaderboard/${resource_id}`,
            {
                responseType: "json",
                headers: {
                    version: "2",
                },
                params: {
                    limit,
                    skip
                },
            }
        ).pipe(
            map(({ data, meta }: Paginated<CuratorStatistics>) => {

                return {
                    data: data.map((stat: CuratorStatistics) => new CuratorStatistics().deserialize(stat)),
                    meta
                }
            })
        )
        return response$;
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

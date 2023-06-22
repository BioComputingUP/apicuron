import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, pluck } from "rxjs/operators";
import { CuratorStatistics } from "src/app/models/statistics.model";
import { environment } from "src/environments/environment";


@Injectable()
export class CuratorStatisticsService {

    constructor(protected http: HttpClient) {

    }
    ws = environment.ws;

    get_curator_statistics(orcid_id: string) {
        return this.http.get(this.ws + '/statistics/user/' + orcid_id, {
            headers: {
                version: '2'
            }
        }).pipe(
            pluck('data'),
            map((data: CuratorStatistics[]) => {
                return data.map((stat: CuratorStatistics) => new CuratorStatistics().deserialize(stat))
            })
        )
    }

    get_resource_statistics(resource_id: string) {
        throw new Error('Not Implemented Error !')
    }
}
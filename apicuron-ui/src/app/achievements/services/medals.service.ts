import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { map, pluck, tap } from 'rxjs/operators'
import { Medal } from 'src/app/models/medal.model'
import { Observable } from 'rxjs'
import { } from 'lodash'
import { AchievementFilter } from 'src/app/achievements/interfaces/achievement-filter'
import { Paginated } from 'src/app/interfaces/paginated'
@Injectable()
export class MedalsService {

    constructor(protected http: HttpClient) { }

    wsUrl = environment.ws + '/achievements/medals'


    getMedals(params: AchievementFilter): Observable<Paginated<Medal>> {
        const url = new URL(this.wsUrl)

        const httpParams = new HttpParams({ fromObject: params.serialize() })
        return this.http.get(url.href, {
            headers: {
                version: '2'
            },
            params: httpParams
        }).pipe(
            // Deserialize medals
            map((paginatedMedals: Paginated<Medal>) => {
                const { data } = paginatedMedals;
                paginatedMedals.data = data.map((medal: Medal) => new Medal().deserialize(medal))
                return paginatedMedals
            })
        )
    }
}
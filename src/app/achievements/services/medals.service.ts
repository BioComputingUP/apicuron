import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { environment } from 'src/environments/environment'
import { map, pluck, tap } from 'rxjs/operators'
import { Medal } from 'src/app/models/medal.model'
import { Observable } from 'rxjs'
import {  } from 'lodash'
@Injectable()
export class MedalsService {

    constructor(protected http: HttpClient) {}

    wsUrl = environment.ws + '/achievements/medals'


    getMedals(params: { curator_orcid: string, page_size: string }): Observable<Medal[]>{
        const url = new URL(this.wsUrl)

        const httpParams = new HttpParams({ fromObject: params })
        return this.http.get(url.href, {
            headers: {
                version: '2'
            },
            params: httpParams
        }).pipe(
            pluck('data'),
            // Deserialize medals
            map((medals: Medal[]) => medals.map((medal:Medal) => new Medal().deserialize(medal)))
        )
    }
}
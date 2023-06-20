import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map, pluck } from 'rxjs/operators'
import { Badge } from 'src/app/models/badge.model'
import { environment } from 'src/environments/environment'

@Injectable()
export class BadgesService {

    constructor(protected http: HttpClient) {}

    wsUrl = environment.ws + '/achievements/badges'


    getBadges(params: { curator_orcid: string, page_size: string }): Observable<Badge[]>{
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
            map((badges: Badge[]) => badges.map((badge:Badge) => new Badge().deserialize(badge)))
        )
    }
}
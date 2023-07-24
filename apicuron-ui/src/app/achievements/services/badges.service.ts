import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map, pluck } from 'rxjs/operators'
import { AchievementFilter } from 'src/app/achievements/interfaces/achievement-filter'
import { Paginated } from 'src/app/interfaces/paginated'
import { Badge } from 'src/app/models/badge.model'
import { environment } from 'src/environments/environment'

@Injectable()
export class BadgesService {

    constructor(protected http: HttpClient) {}

    wsUrl = environment.ws + '/achievements/badges'


    getBadges(params: AchievementFilter): Observable<Paginated<Badge>>{
        const url = new URL(this.wsUrl)

        const httpParams = new HttpParams({ fromObject: params.serialize() })
        return this.http.get(url.href, {
            headers: {
                version: '2'
            },
            params: httpParams
        }).pipe(
            
            // Deserialize medals
            map((badges: Paginated<Badge>) => {
                const { data } = badges
                badges.data = data.map((badge:Badge) => new Badge().deserialize(badge))
                return badges;
            })
        )
    }
    
}
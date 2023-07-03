import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, pluck } from "rxjs/operators";
import { environment } from "../../../environments/environment";



@Injectable()
export class AchievmentsDefService {

    constructor(protected http: HttpClient) { }
    achivementsDefUrl = environment.ws + '/achievements-def'
    badgesUrl = this.achivementsDefUrl + '/badges'
    medalsUrl = this.achivementsDefUrl + '/medals'

    private get_resource_achievements(resource_id: string, type: 'badges' | 'medals') {
        return this.http.get(`${this.achivementsDefUrl}/${type}`, {
            headers: {
                version: '2'
            },
            params: {
                resource_id
            }
        })
    }

    get_resource_badges(resource_id: string) {
        return this.get_resource_achievements(resource_id, 'badges').pipe(pluck('data'))
    }

    get_resource_medals(resource_id: string) {
        return this.get_resource_achievements(resource_id, 'medals').pipe(
            pluck('data'),
            map((medals: Array<any>) => {
                return medals.map((medal) => {
                    if(medal['first_day']){
                        medal['first_day'] = medal['first_day'].slice(0,-1)
                    }
                    if(medal['last_day']){
                        medal['last_day'] = medal['last_day'].slice(0,-1)
                    }
                    return medal
                })
            })
        )
    }

    private update_achievmement(data: any, type: 'medals'|'badges'){
        return this.http.put(
            `${this.achivementsDefUrl}/${type}/edit`,
            data,
            {
                headers: {
                    version: '2'
                }
            }
        )
    }

    private delete_achievement({ resource_id, name}:{ resource_id: string, name: string}, type: 'medals' | 'badges') {
        return this.http.delete(
            `${this.achivementsDefUrl}/${type}/${name}/partner-resource/${resource_id}`,
            {
                headers: {
                    version: '2'
                }
            }
        )
    }

    private create_achievement(data: any, type: 'medals' | 'badges'){
        return this.http.post(
            `${this.achivementsDefUrl}/${type}/create`,
            data,
            {
                headers: {
                    version: '2'
                }
            }
        )
    }

    update_badge(badge: any) {
        return this.update_achievmement(badge, 'badges')
    }

    create_badge(badge: any) {
        return this.create_achievement(badge, 'badges')
    }

    delete_badge({ resource_id, name}:{ resource_id: string, name: string}) {
        return this.delete_achievement({resource_id, name}, 'badges')
    }

    update_medal(medal: any){
        return this.update_achievmement(medal, 'medals')
    }

    delete_medal({ resource_id, name}:{ resource_id: string, name: string}){
        return this.delete_achievement({resource_id, name}, 'medals')
    }
    
    create_medal(medal: any) {
        return this.create_achievement(medal, 'medals')
    }
}
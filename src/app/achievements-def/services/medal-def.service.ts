import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { MedalDefFilter } from "../interfaces/medal-def.filter";
import { Observable } from "rxjs";
import { Paginated } from "../../interfaces/paginated";
import { DeleteMedalDef, MedalDef, UpdateMedalDef } from "../../models/medal-def.model";
import { map } from "rxjs/operators";




@Injectable()
export class MedalDefService {
    

    constructor(protected http: HttpClient) {}
    url: string = new URL('achievements-def/medals/',environment.ws + '/').href;


    getMedalDefs(medalDefFilter: MedalDefFilter): Observable<Paginated<MedalDef>> {
        return this.http.get<Paginated<MedalDef>>(this.url, {
            headers: {
                version: '2'
            },
            params: medalDefFilter.serialize()
        }).pipe(
            map((paginatedMedals: Paginated<MedalDef>) => {
                paginatedMedals.data = paginatedMedals.data.map((medal) => new MedalDef().deserialize(medal))
                return paginatedMedals;
            })
        )
    }

    createMedalDef(medalDef: MedalDef) {
        return this.http.post(this.url, medalDef.serialize(), {
            headers: {
                version: '2'
            },
        })
    }


    updateMedalDef(updateMedal: UpdateMedalDef) {
        return this.http.put(new URL('edit/', this.url).href, updateMedal, {
            headers: {
                version: '2'
            },
        })
    }

    deleteMedal({ name, resource_id }: DeleteMedalDef){
        const link = new URL(`${name}/partner-resource/${resource_id}`, this.url).href;
        return this.http.delete(link, {
            headers: {
                version: "2"
            }
        })
    }
}
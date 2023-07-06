import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { MedalDefFilter } from "../interfaces/medal-def.filter";
import { Observable } from "rxjs";
import { Paginated } from "../../interfaces/paginated";
import { MedalDef } from "../../models/medal-def.model";




@Injectable()
export class MedalDefService {
    

    constructor(protected http: HttpClient) {}
    url = environment.ws;

    getMedalDefs(medalDefFilter: MedalDefFilter): Observable<Paginated<MedalDef>> {
        const url: string = new URL('achievements-def/medals',this.url + '/').href;
        return this.http.get<Paginated<MedalDef>>(url, {
            headers: {
                version: '2'
            },
            params: medalDefFilter.serialize()
        });
    }
}
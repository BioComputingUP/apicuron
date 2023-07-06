import { Injectable } from "@angular/core";
import { BadgeDefFilter } from "../interfaces/badge-def.filter";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable } from "rxjs";
import { Paginated } from "../../interfaces/paginated";
import { BadgeDef } from "../../models/badge-def.model";




@Injectable()
export class BadgeDefService {
    

    constructor(protected http: HttpClient) {}
    url = environment.ws;

    getBadgeDefs(badgeDefFilter: BadgeDefFilter): Observable<Paginated<BadgeDef>> {
        const url: string = new URL('achievements-def/badges',this.url + '/').href;
        return this.http.get<Paginated<BadgeDef>>(url, {
            headers: {
                version: '2'
            },
            params: badgeDefFilter.serialize()
        });
    }
}
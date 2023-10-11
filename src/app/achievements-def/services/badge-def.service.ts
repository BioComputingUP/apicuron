import { Injectable } from "@angular/core";
import { BadgeDefFilter } from "../interfaces/badge-def.filter";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable, of } from "rxjs";
import { Paginated } from "../../interfaces/paginated";
import {
  BadgeDef,
  DeleteBadgeDef,
  UpdateBadgeDef,
} from "../../models/badge-def.model";
import { Badge } from "../../models/badge.model";
import { catchError } from "rxjs/operators";

@Injectable()
export class BadgeDefService {
  constructor(protected http: HttpClient) {}
  url: string = new URL("achievements-def/badges/", environment.ws + "/").href;

  getBadgeDefs(
    badgeDefFilter: BadgeDefFilter
  ): Observable<Paginated<BadgeDef>> {
    return this.http.get<Paginated<BadgeDef>>(this.url, {
      headers: {
        version: "2",
      },
      params: badgeDefFilter.serialize(),
    });
  }

  createBadgeDef(badgeDef: BadgeDef) {
    return this.http.post(this.url, badgeDef.serialize(), {
      headers: {
        version: "2",
      },
    });
  }

  updateBadgeDef(updateBadgeDef: UpdateBadgeDef) {
    return this.http
      .put(new URL("edit/", this.url).href, updateBadgeDef, {
        headers: {
          version: "2",
        },
      })
  }

  deleteBadge({ name, resource_id }: DeleteBadgeDef) {
    const link = new URL(`${name}/partner-resource/${resource_id}`, this.url)
      .href;
    return this.http.delete(link, {
      headers: {
        version: "2",
      },
    });
  }
}

import { Injectable } from "@angular/core";
import { BadgeDefFilter } from "../interfaces/badge-def.filter";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import { Observable, throwError } from "rxjs";
import { Paginated } from "../../interfaces/paginated";
import {
  BadgeDef,
  DeleteBadgeDef,
  UpdateBadgeDef,
} from "../../models/badge-def.model";
import { catchError, map, pluck, tap } from "rxjs/operators";
import { ToastrService } from "ngx-toastr";

@Injectable()
export class BadgeDefService {
  constructor(
    protected http: HttpClient,
    protected toastr: ToastrService,
  ) {}
  url: string = `${environment.ws}/achievements-def/badges/`;

  getBadgeDefs(
    badgeDefFilter: BadgeDefFilter,
  ): Observable<Paginated<BadgeDef>> {
    return this.http.get<Paginated<BadgeDef>>(this.url, {
      headers: {
        version: "2",
      },
      params: badgeDefFilter.serialize(),
    });
  }

  createBadgeDef(badgeDef: BadgeDef): Observable<BadgeDef> {
    return this.http
      .post(this.url, badgeDef.serialize(), {
        headers: {
          version: "2",
        },
      })
      .pipe(
        catchError((error) => {
          if (error instanceof HttpErrorResponse) {
            this.toastr.error(
              `${error.error.message}`,
              `Error (${error.status}) occured while creating badge`,
            );
          }
          return throwError(error);
        }),
        map(({ data }: { data: BadgeDef }) => new BadgeDef().deserialize(data)),
        tap((badgeDef: BadgeDef) => {
          this.toastr.success(
            `Badge ${badgeDef.name} sucessfully Created`,
            "Badge Creation Sucessfull",
          );
        }),
      );
  }

  updateBadgeDef(updateBadgeDef: UpdateBadgeDef): Observable<BadgeDef> {
    return this.http
      .put(`${this.url}/edit`, updateBadgeDef, {
        headers: {
          version: "2",
        },
      })
      .pipe(
        catchError((error) => {
          if (error instanceof HttpErrorResponse) {
            this.toastr.error(
              `${error.error.message}`,
              `Error (${error.status}) occured while updating badge ${updateBadgeDef.displayedName}`,
            );
          }
          return throwError(error);
        }),
        pluck("data"),
        map((badgeDef: BadgeDef) => new BadgeDef().deserialize(badgeDef)),
        tap((badgeDef: BadgeDef) => {
          this.toastr.success(
            `Badge (${badgeDef.displayedName}) sucessfully Updated`,
            "Badge Update Sucessfull",
          );
        }),
      );
  }

  deleteBadge({ name: badgeName, resource_id }: DeleteBadgeDef) {
    const href = `${this.url}/${badgeName}/partner-resource/${resource_id}`;
    return this.http.delete(href, {
      headers: {
        version: "2",
      },
    });
  }
}

import { PlatformLocation } from "@angular/common";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, pluck } from "rxjs/operators";
import { Term } from "src/app/models/term.model";
import { TermsFilter } from "src/app/terms/models/terms-filter";
import { environment } from "src/environments/environment";

@Injectable()
export class TermsService {
  ws: string;
  url: string;
  constructor(
    protected http: HttpClient,

    protected platformLocation: PlatformLocation
  ) {
    this.url = `${environment.ws}/terms`;
  }

  getTerms(termsFilter: TermsFilter): Observable<Term[]> {
    const params = new HttpParams({ fromObject: { ...termsFilter } });

    return this.http
      .get(this.url, {
        headers: {
          version: "2",
        },
        params,
      })
      .pipe(
        map((response) => response['data'] as Term[]),
        map((data: Term[]) => {
          return data.map((term: Term) => new Term().deserialize(term));
        })
      );
  }

  create_term(term: Term) {
    return this.http.post(this.url, term.serialize(), {
      headers: {
        version: "2",
      },
    });
  }
}

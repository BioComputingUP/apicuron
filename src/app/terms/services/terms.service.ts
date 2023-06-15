import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { map, pluck, tap } from "rxjs/operators";
import { Term } from "src/app/models/term.model";
import { TermsFilter } from "src/app/terms/models/terms-filter";
import { environment } from "src/environments/environment";


@Injectable()
export class TermsService {
    
    ws = environment.ws + '/'

    constructor(protected http: HttpClient) {}

    getTerms(termsFilter: TermsFilter): Observable<Term[]> {
        const url = new URL('terms', this.ws).href

        const params = new HttpParams({ fromObject: { ...termsFilter } })

        return this.http.get(url, {
          headers: {
            version: '2'
          },
          params
        }).pipe(
            pluck('data'),
            map((data: Term[]) => {
                return data.map((term:Term) => new Term().deserialize(term))
            })
        )
      }
}
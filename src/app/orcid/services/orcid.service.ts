import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, combineLatest, of, throwError } from "rxjs";
import { catchError, filter, map, pluck } from "rxjs/operators";
import { OrcidInformation, OrcidProfileLink } from "src/app/orcid/types/orcid";
import { environment } from "src/environments/environment";

function OrcidErrorHandler(field) {
  return (err: any, caught: Observable<any>) => {
    if(err && err.status == 404){
        let output = {}
        output[field] = null;
        return of(output);    
    }
  };
}

@Injectable()
export class OrcidService {
  constructor(protected http: HttpClient) {}

  // private orcid_url= 'https://pub.orcid.org/v3.0/'
  private orcid_url = environment.orcid_url;
  private base_headers = {
    Accept: "application/json",
  };

  get_biography(orcid_id: string): Observable<string> {
    const url = new URL(`${orcid_id}/biography`, this.orcid_url);
    return this.http
      .get(url.href, {
        headers: {
          ...this.base_headers,
        },
      })
      .pipe(
        catchError(OrcidErrorHandler('content')),
        filter((response) => !!response["content"]),
        pluck("content")
      );
  }

  get_employment(orcid_id: string): Observable<string> {
    const url = new URL(`${orcid_id}/employments`, this.orcid_url);
    return this.http
      .get(url.href, {
        headers: {
          ...this.base_headers,
        },
      })
      .pipe(
        catchError(OrcidErrorHandler('name')),
        map((response) => {
          const name = response["affiliation-group"][0].summaries[0]["employment-summary"].organization.name;
          return name;
        })
      );
  }

  get_profile_links(orcid_id: string): Observable<OrcidProfileLink[]> {
    const url = new URL(`${orcid_id}/researcher-urls`, this.orcid_url);

    return this.http
      .get(url.href, {
        headers: {
          ...this.base_headers,
        },
      })
      .pipe(
        catchError(OrcidErrorHandler('researcher-url')),
        filter(({ "researcher-url": urls }: any) => !!urls && urls),
        pluck("researcher-url"),
        map((url_list) => {
          // for each url in the url_list, build object containing "name" and "url" attributes
          // return url_list.map(({ "url-name": name, url }) => {
          //   return { name, value: new URL(url.value) };
          // });
          return url_list.map(({ "url-name": name, url }) => {
            const value = new URL(url.value);
            return { name, value, host: value.host };
          });
        }),
        filter((urls) => !!urls && urls.length > 0),
      );
  }

  get_keywords(orcid_id: string): Observable<string[]> {
    const url = new URL(`${orcid_id}/keywords`, this.orcid_url);
    return this.http
      .get(url.href, {
        headers: {
          ...this.base_headers,
        },
      })
      .pipe(
        catchError(OrcidErrorHandler('keyword')),
        filter(
          (response: any) => !!response.keyword && response.keyword.length > 0
        ),
        pluck("keyword"),
        map((keyword_list: any[]): string[] => {
          return keyword_list.map((keyword) => keyword.content);
        }),
        filter((keywords) => !!keywords && keywords.length > 0)
      );
  }

  get_orcid_info(orcid_id: string): Observable<OrcidInformation> {
    const biography$ = this.get_biography(orcid_id);
    const profile_links$ = this.get_profile_links(orcid_id);
    const keywords$ = this.get_keywords(orcid_id);
    const employment$ = this.get_employment(orcid_id);
    return combineLatest([biography$, profile_links$, keywords$, employment$]).pipe(
      map(([biography, profileLinks, keywords, employment]) => {
        return {
          // biography: biography,
          biography,
          profileLinks,
          keywords,
          employment,
        };
      })
    );
  }
}

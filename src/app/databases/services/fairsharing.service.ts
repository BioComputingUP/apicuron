import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { combineLatest, Observable, of } from "rxjs";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from "rxjs/operators";
import { environment } from "src/environments/environment";
import {
  createLoadingState,
  switchMapWithLoading,
} from "../../../../projects/apicuron-util/src/lib/loadable/loading-state";

@Injectable()
export class FairSharingService {
  constructor(private http: HttpClient) {}

  private farisharingDOIRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/;
  private fairsharing_url = environment.fairsharing_url;
  private base_headers = {
    Accept: "application/json",
  };

  validateDoi(input: string) {
    // if string is empty, do not throw an error
    // return null
    if (input == "") {
      return null;
    }
    // if it's a URL
    try {
      const url = new URL(input);
      // if it's a fairsharing URL or a doi URL, query it
      if (["doi.org", "fairsharing.org"].includes(url.host)) {
        const code = url.pathname.split("/").pop();
        return new URL(code, this.fairsharing_url);
      }
      throw new Error(
        `Passed Invalid URL, must be a doi.org or fairsharing.org`
      );
    } catch (err: any) {
      // not a url, it should match the regular fairsharing DOI
      if (!input.match(this.farisharingDOIRegex)) {
        throw new Error(`Invalid FairSharing DOI`);
      }
      return new URL(input, this.fairsharing_url);
    }
  }

  queryFairsharing(url: URL) {
    return this.http
      .get(url.href, {
        headers: {
          ...this.base_headers,
        },
      })
      .pipe(
        catchError((err: any, caught) => {
          throw new Error(`Resource not found in Fairsharing`);
        })
      );
  }

  getMetadata(input: string): Observable<any | null> {
    return of(input).pipe(
      map(this.validateDoi.bind(this)),
      switchMap((url: URL | null) => {
        if (url == null) {
          return of(null);
        }
        const request$ = this.queryFairsharing(url);
        return combineLatest([request$, of(url)]);
      }),
      map(([data, url]) => {
        return {
          ...data,
          resource_url: url,
        };
      })
    );
  }

  getFairsharingObservable(url: Observable<string>) {
    return url.pipe(
      debounceTime(150),
      distinctUntilChanged(),
      switchMapWithLoading(this.getMetadata.bind(this))
    );
  }
}

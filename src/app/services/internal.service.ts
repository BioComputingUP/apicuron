import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {Observable, throwError, of} from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InternalService {
  private apicuronBrowse = environment.ws + 'browse';
  private apicuronProfile = environment.ws + 'profile/';

  constructor (private http: HttpClient) {

  }

  GetDisProtBrowse(): Observable<any> {
    return this.http.get(
      this.apicuronBrowse,
      {responseType: 'json'});
    // .pipe(catchError(err => of(console.error(err))));
  }

  GetProfile(orcid_id): Observable<any> {
    return this.http.get(
      this.apicuronProfile + orcid_id,
      {responseType: 'json'});
    // .pipe(catchError(err => of(console.error(err))));
  }
}

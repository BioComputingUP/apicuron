import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {Observable, throwError, of} from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InternalService {
  private disprotBrowse = environment.ws + 'browse';

  constructor (private http: HttpClient) {

  }




  GetDisProtBrowse(): Observable<any> {
    return this.http.get(
      this.disprotBrowse,
      {responseType: 'json'});
    // .pipe(catchError(err => of(console.error(err))));
  }
}

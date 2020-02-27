import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import {Observable, throwError, of} from 'rxjs';

import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InternalService {
  private apicuronSearch = environment.ws + 'search';
  private apicuronProfile = environment.ws + 'profile/';
  private apicuronPostProfileData = environment.ws + 'postProfileData';
  private apicuronPostProfilePicture = environment.ws + 'postProfilePicture/';
  private apicuronGetProfilePicture = environment.ws + 'getProfilePicture/';
  private apicuronGetJwtToken = environment.ws + 'token';
  private apicuronGetJwtTokenForUser = environment.ws + 'tokenForUser/';
  private apicuronListUser = environment.ws + 'listUser';
  private apicuronRegNewUser = environment.ws + 'registerUser';
  private apicuronDeteteUser = environment.ws + 'deleteUser/';

  constructor (private http: HttpClient) {

  }
  //
  // GetSearch(params): Observable<any> {
  //   return this.http.get(
  //     this.apicuronSearch,
  //     {responseType: 'json', params: params});
  // }

  GetProfile(id): Observable<any> {
    return this.http.get(
      this.apicuronProfile + id,
      {responseType: 'json'});
    // .pipe(catchError(err => of(console.error(err))));
  }
  GetSearch(params): Observable<any> {
    return this.http.get(
      this.apicuronSearch,
      {responseType: 'json', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }

  PostProfileData(profileObj): Observable<any> {
    return this.http.post(this.apicuronPostProfileData, profileObj);
  }

  PostProfilePicture(profilePicture, id): Observable<any> {
    return this.http.post(this.apicuronPostProfilePicture + id, profilePicture);
  }

  GetProfilePicture(id): Observable<any> {
    return this.http.get(
      this.apicuronGetProfilePicture + id);
    // .pipe(catchError(err => of(console.error(err))));
  }

  DeleteUser(id): Observable<any> {
    return this.http.get(
      this.apicuronDeteteUser + id);
    // .pipe(catchError(err => of(console.error(err))));
  }

  GetPubDisProtGetJwtToken(): Observable<any> {
    return this.http.get(
      this.apicuronGetJwtToken,
      {responseType: 'json'});
  }

  GetApucuronJwtTokenForUser(id): Observable<any> {
    return this.http.get(
      this.apicuronGetJwtTokenForUser + id,
      {responseType: 'json'});
  }

  GetUsersList(): Observable<any> {
    return this.http.get(
      this.apicuronListUser,
      {responseType: 'json'});
    // .pipe(catchError(err => of(console.error(err))));
  }

  RegisterNewUser(newUserObj): Observable<any> {
    return this.http.post(
      this.apicuronRegNewUser,
      newUserObj).pipe();
  }

}

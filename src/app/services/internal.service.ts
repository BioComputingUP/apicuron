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
  private apicuronPostProfileData = environment.ws + 'postProfileData';
  private apicuronPostProfilePicture = environment.ws + 'postProfilePicture/';
  private apicuronGetProfilePicture = environment.ws + 'getProfilePicture/';
  private apicuronGetJwtToken = environment.ws + 'token';
  private apicuronListUser = environment.ws + 'listUser';
  private apicuronRegNewUser = environment.ws + 'registerUser';

  constructor (private http: HttpClient) {

  }

  GetDisProtBrowse(): Observable<any> {
    return this.http.get(
      this.apicuronBrowse,
      {responseType: 'json'});
    // .pipe(catchError(err => of(console.error(err))));
  }

  GetProfile(id): Observable<any> {
    return this.http.get(
      this.apicuronProfile + id,
      {responseType: 'json'});
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

  GetPubDisProtGetJwtToken(): Observable<any> {
    return this.http.get(
      this.apicuronGetJwtToken,
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

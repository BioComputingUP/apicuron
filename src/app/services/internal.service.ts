import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, throwError, of} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InternalService {
  private getORCIDprofile = 'https://pub.orcid.org/v3.0/';
  private apicuronSearch = environment.ws + 'search';
  private apicuronSearch2 = environment.ws + 'browse';
  private apicuronProfile = environment.ws + 'profile/';
  private apicuronPostProfileData = environment.ws + 'postProfileData';
  private apicuronPostProfilePicture = environment.ws + 'postProfilePicture/';
  private apicuronGetProfilePicture = environment.ws + 'getProfilePicture/';
  private apicuronGetJwtToken = environment.ws + 'token';
  private apicuronGetJwtTokenForUser = environment.ws + 'tokenForUser/';
  private apicuronListUser = environment.ws + 'listUser';
  private apicuronRegNewUser = environment.ws + 'registerUser';
  private apicuronDeteteUser = environment.ws + 'deleteUser/';
  private apicuronResources = environment.ws + 'resources';
  private disprotFeedback = environment.ws + 'feedback';
  private apicuronLeaderboard = environment.ws + 'leaderboard/';

  constructor(private http: HttpClient) {
  }

  GetProfile(id): Observable<any> {
    return this.http.get(
      this.apicuronProfile + id,
      {responseType: 'json'});
    // .pipe(catchError(err => of(console.error(err))));
  }

  GetLeaderboard(database, params): Observable<any> {
    return this.http.get(
      this.apicuronLeaderboard + database,
      {responseType: 'json', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }

  GetSearch(params): Observable<any> {
    return this.http.get(
      this.apicuronSearch,
      {responseType: 'json', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }


  GetSearch2(params): Observable<any> {
    return this.http.get(
      this.apicuronSearch2,
      {responseType: 'json', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }

  SendFeedback(mailObj): Observable<any> {
    return this.http.post(
      this.disprotFeedback,
      mailObj).pipe();
  }

  PostProfileData(profileObj): Observable<any> {
    return this.http.post(this.apicuronPostProfileData, profileObj);
  }

  PostProfilePicture(profilePicture, id): Observable<any> {
    return this.http.post(this.apicuronPostProfilePicture + id, profilePicture);
  }

  GetORCIDprofile(id): Observable<any> {
    return this.http.get(
      this.getORCIDprofile + id, {responseType: 'json', headers: {Accept: 'application/json'}});
    // .pipe(catchError(err => of(console.error(err))));
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

  GetResearces(params): Observable<any> {
    // console.log(params);
    return this.http.get(
      this.apicuronResources,
      {responseType: 'json', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }

  RegisterNewUser(newUserObj): Observable<any> {
    return this.http.post(
      this.apicuronRegNewUser,
      newUserObj).pipe();
  }
}

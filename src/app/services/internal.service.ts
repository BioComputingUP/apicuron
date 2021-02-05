import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, throwError, of} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InternalService {
  private wsUrl = environment.ws;

  // TODO remove the following block and functions
  private apicuronSearch = environment.ws + 'search';
  private apicuronStat = environment.ws + 'stat';
  private apicuronSearch2 = environment.ws + 'browse';
  private apicuronPostProfileData = environment.ws + 'postProfileData';
  private apicuronResources = environment.ws + 'resources';
  private disprotFeedback = environment.ws + 'feedback';
  private apicuronLeaderboard = environment.ws + 'leaderboard/';
  private apicuronStatistics = environment.ws + 'statistics';
  private apicuronSearchDetails = environment.ws + 'reports';



  // Auth
  private apicuronProfile = environment.ws + 'profile/';

  // Profile
  private apicuronPostProfilePicture = environment.ws + 'postProfilePicture/';
  private apicuronGetProfilePicture = environment.ws + 'getProfilePicture/';

  // Admin services
  private apicuronGetJwtToken = environment.ws + 'token';
  private apicuronGetJwtTokenForUser = environment.ws + 'tokenForUser/';
  private apicuronListUser = environment.ws + 'listUser';
  private apicuronRegNewUser = environment.ws + 'registerUser';
  private apicuronDeteteUser = environment.ws + 'deleteUser/';



  // TODO make it external
  private getORCIDprofile = 'https://pub.orcid.org/v3.0/';
  GetORCIDprofile(id): Observable<any> {
    return this.http.get(
      this.getORCIDprofile + id, {responseType: 'json', headers: {Accept: 'application/json'}});
    // .pipe(catchError(err => of(console.error(err))));
  }


  constructor(private http: HttpClient) {
  }




  getReports(params: HttpParams): Observable<any> {
    const url = this.wsUrl + 'reports';
    return this.http.get(url, {params});
  }


  getReportsStats(params: HttpParams): Observable<any> {
    const url = this.wsUrl + 'reports/statistics';
    return this.http.get(url, {params});
  }

  getAchievements(params: HttpParams): Observable<any> {
    const url = this.wsUrl + 'achievements';
    return this.http.get(url, {params});
  }

  getLeaderboards(params: HttpParams): Observable<any> {
    const url = this.wsUrl + 'leaderboards';
    return this.http.get(url, {params});
  }





  GetProfile(id): Observable<any> {
    return this.http.get(
      this.apicuronProfile + id,
      {responseType: 'json'});
    // .pipe(catchError(err => of(console.error(err))));
  }


  // Profile

  PostProfilePicture(profilePicture, id): Observable<any> {
    console.log(this.apicuronPostProfilePicture + id);
    console.log(profilePicture);
    return this.http.post(
      this.apicuronPostProfilePicture + id,
      profilePicture,
      {
        reportProgress: true,
        observe: 'events'
      });
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







  // TODO remove
  GetLeaderboard(database, params): Observable<any> {
    return this.http.get(
      this.apicuronLeaderboard + database,
      {responseType: 'json', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }
  GetStatistics(params): Observable<any> {
    return this.http.get(
      this.apicuronStatistics,
      {responseType: 'json', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }
  GetStatistics2(params): Observable<any> {
    return this.http.get(
      this.apicuronStatistics,
      { observe: 'response', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }

  GetSearch(params): Observable<any> {
    return this.http.get(
      this.apicuronSearch,
      {responseType: 'json', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }

  GetSearchDetails(params): Observable<any> {
    return this.http.get(
      this.apicuronSearchDetails,
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

  GetStat(): Observable<any> {
    return this.http.get(
      this.apicuronStat,
      {responseType: 'json'});
  }

  GetResearces(params): Observable<any> {
    // console.log(params);
    return this.http.get(
      this.apicuronResources,
      {responseType: 'json', params: params});
    // .pipe(catchError(err => of(console.error(err))));
  }

}

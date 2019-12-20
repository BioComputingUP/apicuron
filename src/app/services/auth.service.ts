import {Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {BehaviorSubject, concat, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {Component, OnInit, Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})


@Injectable()
export class AuthService {
  private disprotLogOut = environment.ws + 'logout';
  private disprotAuth = environment.ws + 'profile';

  loginData = new BehaviorSubject<object>({
    authorized: false,
    username: null,
    displayedName: null,
    role: null,
    message: null,
    initial: true,
  });

  constructor(public router: Router,
              private http: HttpClient) {

  }

  GetLogOut(): Observable<any> {
    return this.http.get(this.disprotLogOut, {responseType: 'json'});
  }

  GetAuth(): Observable<any> {
    return this.http.get(this.disprotAuth, {responseType: 'json'});
  }

  authentication(): Promise<object> {
    return new Promise((resolve, reject) => {
      this.GetAuth().subscribe(
        result => {
          this.loginData.next(result);
        },
        error1 => {
        },
        () => {
          console.log('authentication');
          // console.log(this.loginData.value);
          resolve(this.loginData);
        });
    });
  }


    logout(): void {
    const observables = [];
    observables.push(this.GetLogOut());
    concat(...observables).subscribe(
      result => {
        console.log(result);
      },
      err => console.log(err),
      () => {
        this.router.navigateByUrl('/login');
      }
    );
  }


}

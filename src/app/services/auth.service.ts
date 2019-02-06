import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {BehaviorSubject, concat, Observable} from 'rxjs';
import { HttpClient} from '@angular/common/http';
import { Component, OnInit, Injectable} from '@angular/core';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Injectable({
  providedIn: 'root'
})


@Injectable()
export class AuthService {

  private googleLogIn = environment.ws + 'google';
  private disprotLogOut = environment.ws + 'logout';
  private disprotAuth = environment.ws + 'profile';
  private result = {};
  userSource = new BehaviorSubject<object>({
    authorized: false,
    username: null,
    displayedName: null,
    role: null,
    message: null
  });

  private messageSource = new BehaviorSubject<boolean>(false);
  currentMessage = this.messageSource.asObservable();
  private authSource = new BehaviorSubject<boolean>(false);
  currentAuth = this.authSource.asObservable();
  private usernameSource = new BehaviorSubject<boolean>(false);
  currentUsername = this.usernameSource.asObservable();
  private displayedNameSource = new BehaviorSubject<string>('');
  currentDisplayedName = this.displayedNameSource.asObservable();
  private roleSource = new BehaviorSubject<boolean>(false);
  currentRole = this.roleSource.asObservable();

  private loginMessage = '';

  constructor(public router: Router,
              private http: HttpClient) {

  }

  GetAuth(): Observable<any> {
    return this.http.get(this.disprotAuth, {responseType: 'json'});
  }

  GetLogOut(): Observable<any> {
    return this.http.get(this.disprotLogOut, {responseType: 'json'});
  }

  login(): void {
    const observables = [];
    observables.push(this.GetAuth());
    concat(...observables).subscribe(
      result => {
        this.result = result;
        // console.log(result);
      },
      err => console.log(err),
      () => {
        if (this.userSource['authorized'] === false) {
          this.loginMessage = 'You are not permitted, please contact us!';
          this.router.navigateByUrl('/login');
        } else {
          this.authSource.next(this.result['authorized']);
          this.usernameSource.next(this.result['username']);
          this.displayedNameSource.next(this.result['displayedName']);
          this.roleSource.next(this.result['role']);
          this.messageSource.next(this.result['message']);
        }
      }
    );
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


  GetLoginMassage(): string {
    return this.loginMessage;
  }

  GetCurrentUser(): object {
    return this.userSource;
  }


}

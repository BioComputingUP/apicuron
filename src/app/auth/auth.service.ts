import { Router } from "@angular/router";
import { filter, map, pluck } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { BehaviorSubject, combineLatest, concat, Observable } from "rxjs";
import {
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Component, OnInit, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
@Injectable()
export class AuthService implements HttpInterceptor {
  private disprotLogOut = environment.ws + "logout";
  private disprotAuth = environment.ws + "profile";

  loginData = new BehaviorSubject<object>({
    authorized: false,
    username: null,
    displayedName: null,
    role: null,
    message: null,
    initial: true,
    orcid_id: null,
  });

  user$ = new BehaviorSubject<object>({
    displayedName: null,
    role: null,
    orcid_id: null,
  });

  // authentication JWT token key and value
  token_key = "authorization";
  // token_value getter and setter from localStorage

  get token_value() {
    return localStorage.getItem(this.token_key);
  }

  set token_value(value: string | null) {
    // this measure is necessary because setting null
    // to the localstorage returns a "null" string (which is wrong)
    if (value == null) {
      localStorage.removeItem(this.token_key);
    } else {
      localStorage.setItem(this.token_key, value);
    }
  }

  constructor(public router: Router, private http: HttpClient) {
    // when the app loads we would check the localStorage for the token
    // if there is no token we check the cookies (as an initial logging situation)
    if (this.token_value) {
      // if we find the token we fetch the user data and set it in the user$ behaviorSubject
      this.get_user_data();
    } else {
      // we check in the cookies for the token
      const cookies = document.cookie.split("; ");
      // get the cookie value
      const authorization_cookie = cookies.find((x: string) =>
        x.startsWith(this.token_key)
      );

      // if the cookie value is there
      if (authorization_cookie) {
        // we remove it from the cookies and add it to the localStorage
        document.cookie = ` ${this.token_key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;

        // extract the jwt token value
        const [_, token_value] = authorization_cookie.split("=");
        this.token_value = decodeURI(token_value);
        this.get_user_data();
      }
    }
  }

  get_user_data() {
    // request to get the current user
    const user_data$ = this.http.get(environment.ws + "/auth/profile", {
      headers: {
        authorization: this.token_value,
      },
    });

    // request to get the user current notifications
    const user_notifications$ = this.http
      .get(environment.ws + "/notifications", {
        headers: {
          authorization: this.token_value,
          version: '2'
        },
      })
      .pipe(pluck("data"));
    
    // combine the two data into one and push it to the user subject
    combineLatest([user_data$, user_notifications$])
      .pipe(
        map(([user_data, user_notifications]) => {
          return { ...user_data, notifications: user_notifications}
        })
      )
      .subscribe((user) => this.user$.next(user));
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // if we have the token_value
    // we add the authorization JWT token to the request headers

    if (this.token_value) {
      // cloning the request and getting the headers
      const cloned = req.clone({
        headers: req.headers.set(this.token_key, this.token_value),
      });

      // returning the cloned request
      return next.handle(cloned);
    } else {
      // if we don't have the token_value, we return the original request without the auth headers
      return next.handle(req);
    }
  }

  get loggedIn() {
    return !!this.token_value;
  }

  GetLogOut(): Observable<any> {
    return this.http.get(this.disprotLogOut, { responseType: "json" });
  }

  GetAuth(): Observable<any> {
    return this.http.get(this.disprotAuth, { responseType: "json" });
  }

  authentication(): Promise<object> {
    return new Promise((resolve, reject) => {
      this.GetAuth().subscribe(
        (result) => {
          this.loginData.next(result);
        },
        (error1) => {},
        () => {
          console.log("authentication");
          // console.log(this.loginData.value);
          resolve(this.loginData);
        }
      );
    });
  }

  logout(): void {
    this.token_value = null;
  }
}

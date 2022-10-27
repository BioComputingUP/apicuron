import { Router } from "@angular/router";
import { defaultIfEmpty, filter, map, pluck, shareReplay, switchMap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import {
  BehaviorSubject,
  combineLatest,
  concat,
  Observable,
  of,
  Subscriber,
} from "rxjs";
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

  user$: Observable<any>;

  loggedIn$ = new BehaviorSubject<Boolean>(false);

  // authentication JWT token key and value
  token_key = "authorization";

  constructor(public router: Router, private http: HttpClient) {
    this.token_value = this.get_auth_token();
    this.user$ = this.set_user_data();
  }

  private set_user_data(): Observable<Object> {
    // request to get the current user
    const user_data$: Observable<Object> = this.http.get(
      environment.ws + "/auth/profile",
      {
        headers: {
          authorization: this.token_value,
        },
      }
    ).pipe(shareReplay())

    // request to get the user current notifications
    const user_notifications$: Observable<Array<any>> = this.http
      .get(environment.ws + "/notifications", {
        headers: {
          authorization: this.token_value,
          version: "2",
        },
      })
      .pipe(shareReplay(), pluck("data"));

    // combine the two data into one and push it to the user subject
    return combineLatest([user_data$, user_notifications$]).pipe(
      map(([user_data, user_notifications]: [Object, Array<any>]) => {
        return { ...user_data, notifications: user_notifications };
      })
    );
  }

  get token_value() {
    return localStorage.getItem(this.token_key);
  }

  set token_value(value: string | null) {
    if (value) {
      localStorage.setItem(this.token_key, value);
      this.loggedIn$.next(true);
    } else {
      localStorage.removeItem(this.token_key);
      this.loggedIn$.next(false);
    }
  }

  private get_auth_token(): string | null {
    const token_key = "authorization";
    const auth_token = localStorage.getItem(token_key);
    if (auth_token) {
      return auth_token;
    } else {
      const token_value = this.get_token_from_cookies();
      if (token_value) {
        return token_value;
      }
    }
    return null;
  }

  private get_token_from_cookies(): string | null {
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
      return decodeURI(token_value);
    } else {
      return null;
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // if we have the token_value
    // we add the authorization JWT token to the request headers

    if (this.token_value && req.url.startsWith(environment.ws)) {
      // cloning the request and getting the headers
      const cloned = req.clone({
        headers: req.headers.set(this.token_key, this.token_value),
      });
      // returning the cloned request
      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
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
    this.router.navigate([""]);
  }
}

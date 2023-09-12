import { Router } from "@angular/router";
import {
  catchError,
  filter,
  map,
  pluck,
  shareReplay,
  switchMap,
  tap,
} from "rxjs/operators";
import { environment } from "../../environments/environment";
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  Subscription,
} from "rxjs";
import {
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User } from "src/app/models/User.model";
import * as _ from "lodash";

@Injectable({
  providedIn: "root",
})
export class AuthService implements HttpInterceptor {
  private logoutUrl = environment.ws + "logout";
  private authUrl = environment.ws + "profile";
  login_link = environment.auth_ws + "/auth/orcid";

  loginData = new BehaviorSubject<object>({
    authorized: false,
    username: null,
    displayedName: null,
    role: null,
    message: null,
    initial: true,
    orcid_id: null,
  });

  orcidToken$: BehaviorSubject<string | null> = new BehaviorSubject(null);
  jwtToken$: BehaviorSubject<string | null> = new BehaviorSubject(null);

  private readonly jwtPrefix = "bearer";
  private readonly jwtHeader = "authorization";
  private readonly orcidHeader = "orcid-token";

  private requestHeaders$: Observable<any>;

  user$: Observable<any>;

  loggedIn$: Observable<Boolean>;

  // authentication JWT token key and value
  orcidPopup: Window;
  destroy$: any;

  constructor(public router: Router, private http: HttpClient) {
    this.getTokens();

    this.requestHeaders$ = combineLatest([
      this.orcidToken$,
      this.jwtToken$,
    ]).pipe(
      map(([orcidToken, jwtToken]: [string, string]) => {
        let headers = {};
        if (orcidToken) {
          headers[this.orcidHeader] = orcidToken;
        }
        if (jwtToken) {
          headers[this.jwtHeader] = this.jwtPrefix + " " + jwtToken;
        }

        return headers;
      })
    );

    this.loggedIn$ = this.requestHeaders$.pipe(
      map((headers: any) => {
        return Object.keys(headers).length > 0;
      })
    );

    // this.token_value = this.get_auth_token();
    this.user$ = this.requestHeaders$.pipe(
      filter((headers) => {
        return !_.isEmpty(headers);
      }),
      switchMap((headers) => {
        return this.http.get(environment.ws + "/auth/profile", {
          headers: {
            ...headers,
          },
        });
      }),
      shareReplay(),
      map((user: User) => new User().deserialize(user))
    );

    const windowMessageEventListener = (event: MessageEvent) => {
      const allowedOrigins = [
        new URL(environment.host).origin,
        new URL(environment.ws).origin,
      ];

      if (allowedOrigins.includes(event.origin)) {
        if (_.isObject(event.data) && event.data["access_token"]) {
          const access_token = event.data["access_token"];
          if (access_token) {
            this.setOrcidToken(access_token);
            window.addEventListener("message", windowMessageEventListener);
          }
        }
      }
    };
    window.addEventListener("message", windowMessageEventListener);
  }

  public setOrcidToken(orcidToken: string | null) {
    this.orcidToken$.next(orcidToken);
    orcidToken
      ? localStorage.setItem(this.orcidHeader, orcidToken)
      : localStorage.removeItem(this.orcidHeader);
  }

  loadJwtToken(): Observable<string> {
    return this.jwtToken$.pipe(
      switchMap((token) => {
        if (token) {
          return of(token);
        } else {
          const url = new URL("auth/token", environment.ws + "/");
          const request: Observable<Object> = this.http.get(url.href);
          return request;
        }
      }),
      pluck("token"),
      map((token: string) => {
        const [prefix, key] = token.split(" ");
        return key;
      })
    );
  }

  private getTokens() {
    const jwtToken = localStorage.getItem(this.jwtHeader);
    if (jwtToken) {
      this.jwtToken$.next(jwtToken);
    }
    const orcidToken = localStorage.getItem(this.orcidHeader);
    if (orcidToken) {
      this.orcidToken$.next(orcidToken);
    }
  }

  private dropTokens(){
    localStorage.removeItem(this.jwtHeader);
    localStorage.removeItem(this.orcidHeader);
    this.orcidToken$.next(null)
    this.jwtToken$.next(null)
  }

  get token_value() {
    return this.jwtToken$.getValue();
  }

  set token_value(value: string | null) {
    this.jwtToken$.next(value);
    value
      ? localStorage.setItem(this.jwtHeader, value)
      : localStorage.removeItem(this.jwtHeader);
  }
  // Old method to extract token from cookies
  // private get_token_from_cookies(): string | null {
  //   // we check in the cookies for the token
  //   const cookies = document.cookie.split("; ");
  //   // get the cookie value
  //   const authorization_cookie = cookies.find((x: string) =>
  //     x.startsWith(this.jwtHeader)
  //   );

  //   // if the cookie value is there
  //   if (authorization_cookie) {
  //     // we remove it from the cookies and add it to the localStorage
  //     document.cookie = ` ${this.jwtHeader}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;

  //     // extract the jwt token value
  //     const [_, token_value] = authorization_cookie.split("=");
  //     return decodeURI(token_value);
  //   } else {
  //     return null;
  //   }
  // }

  public openOauthDialog() {
    if (!this.orcidPopup) {
      this.orcidPopup = window.open(this.login_link, "popup", "popup=true");
    } else {
      if (this.orcidPopup.closed) {
        this.orcidPopup = window.open(this.login_link, "popup", "popup=true");
      }
    }
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // if we have the token_value
    // we add the authorization JWT token to the request headers

    return this.requestHeaders$.pipe(
      switchMap((authHeaders: any) => {
        if (
          req.url.startsWith(environment.ws) &&
          !!authHeaders &&
          !_.isEmpty(authHeaders)
        ) {
          const cloned = req.clone({
            setHeaders: authHeaders,
          });
          return next.handle(cloned).pipe(catchError((err: HttpErrorResponse) => {
            if(err.status == 401){
              this.dropTokens();
              return next.handle(req);
            }
          }));
        } else {
          return next.handle(req);
        }
      }),
    );

  }

  GetLogOut(): Observable<any> {
    return this.http.get(this.logoutUrl, { responseType: "json" });
  }

  GetAuth(): Observable<any> {
    return this.http.get(this.authUrl, { responseType: "json" });
  }

  logout(): void {
    this.token_value = null;
    this.setOrcidToken(null);
    this.router.navigate([""]);
  }
}

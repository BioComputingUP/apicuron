import { Router, UrlTree } from "@angular/router";
import {
  catchError,
  filter,
  map,
  pluck,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from "rxjs/operators";
import { environment } from "../../environments/environment";
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  Subject,
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
import { Injectable, OnDestroy } from "@angular/core";
import { User } from "src/app/models/User.model";
import * as _ from "lodash";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
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

  public requestHeaders$: Observable<[string, string][]>;

  user$: Observable<any>;

  loggedIn$: Observable<boolean>; // = new BehaviorSubject(false);

  // this variable describes the initial location where the user attempted to authenticate, defaults to home
  // By using this variable we can identify where did the user authenticate from
  source$ = new BehaviorSubject<string>("home");

  // Source to target mapper, maps sources to target redirection urls
  loginUrlMapper = new Map<string, string[]>([
    ["home", ["/"]],
    ["curator", ["/curators"]],
  ]);

  // authentication JWT token key and value
  orcidPopup: Window;
  destroy$ = new Subject<boolean>();

  constructor(public router: Router, private http: HttpClient) {
    this.loadTokens();

    this.requestHeaders$ = combineLatest([
      this.orcidToken$,
      this.jwtToken$,
    ]).pipe(
      map(([orcidToken, jwtToken]: [string, string]) => {
        const headers: [string, string][] = [];
        if (orcidToken) {
          headers.push([this.orcidHeader, orcidToken]);
        }
        if (jwtToken) {
          headers.push([this.jwtHeader, this.jwtPrefix + " " + jwtToken]);
        }


        return headers || null;
      })
    );

    this.loggedIn$ = combineLatest([this.orcidToken$, this.jwtToken$]).pipe(
      map(([orcid, jwt]: [string, string]) => {
        const val = !!orcid || !!jwt;

        return val;
      })
    );

    this.user$ = this.requestHeaders$.pipe(
      filter((headers: [string, string][]) => {
        return headers.length > 0;
      }),
      switchMap((headers: [string, string][]) => {
        return this.http.get(environment.ws + "/auth/profile", {
          headers: {
            ..._.fromPairs(headers),
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
          if (!access_token) {
            return;
          }
          this.setOrcidToken(access_token);
          this.redirectAfterAuth();
          window.addEventListener("message", windowMessageEventListener);
        }
      }
    };
    window.addEventListener("message", windowMessageEventListener);
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  public setOrcidToken(orcidToken: string | null) {
    this.orcidToken$.next(orcidToken);
    if (orcidToken) {
      localStorage.setItem(this.orcidHeader, orcidToken);
    } else {
      localStorage.removeItem(this.orcidHeader);
    }
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

  private loadTokens() {
    const jwtToken = localStorage.getItem(this.jwtHeader);
    if (jwtToken) {
      this.jwtToken$.next(jwtToken);
    }
    const orcidToken = localStorage.getItem(this.orcidHeader);
    if (orcidToken) {
      this.orcidToken$.next(orcidToken);
    }
  }

  public dropTokens() {
    localStorage.removeItem(this.jwtHeader);
    localStorage.removeItem(this.orcidHeader);
    this.orcidToken$.next(null);
    this.jwtToken$.next(null);
  }

  redirectAfterAuth() {
    const source = this.source$.value;

    this.router.navigate(this.loginUrlMapper.get(source));
  }

  public openOauthDialog(source?: string) {
    if (source) {
      this.source$.next(source);
    }
    if (!this.orcidPopup) {
      this.orcidPopup = window.open(this.login_link, "popup", "popup=true");
    } else {
      if (this.orcidPopup.closed) {
        this.orcidPopup = window.open(this.login_link, "popup", "popup=true");
      }
    }
  }

  logout(): void {
    this.dropTokens();
    this.router.navigate([""]);
  }
}

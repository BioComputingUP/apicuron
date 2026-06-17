import { Router } from "@angular/router";
import {
  distinctUntilChanged,
  filter,
  map,
  pluck,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
} from "rxjs/operators";
import { environment } from "../../environments/environment";
import { BehaviorSubject, combineLatest, Observable, of, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { User } from "src/app/models/User.model";
import * as _ from "lodash";

export type LoginEventData = {
  user: User;
  isNew: boolean;
  loginTime: Date;
};
@Injectable({
  providedIn: "root",
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
  private logged_in_orcid = new BehaviorSubject<string | null>(null);
  loggedInOrcid$ = this.logged_in_orcid.asObservable();
  user$: Observable<User>;
  private loginEvent = new Subject<LoginEventData>();
  loginEvent$ = this.loginEvent.asObservable(); // expose observable to other components

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

  constructor(
    public router: Router,
    private http: HttpClient,
  ) {
    this.loadTokens();

    // Header are built using latest orcid token and jwt
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

        return headers;
      }),
      distinctUntilChanged((prev, next) => {
        if (prev.length !== next.length) {
          return false; // emit new headers since there's no match
        }
        return prev.every((header, index) => {
          return header[0] === next[index][0] && header[1] === next[index][1];
        });
      }),
      shareReplay(1),
    );

    // Anytime the headers change, recheck the login state
    this.loggedIn$ = this.requestHeaders$.pipe(
      map((headers: [string, string][]) => {
        return headers.length > 0;
      }),

      shareReplay(1),
    );
    // this.loggedIn$ = combineLatest([this.orcidToken$, this.jwtToken$]).pipe(
    //   map(([orcid, jwt]: [string, string]) => {
    //     const val = !!orcid || !!jwt;

    //     return val;
    //   })
    // );

    this.user$ = this.loggedIn$.pipe(
      filter((loggedIn) => loggedIn),

      switchMap(() =>
        this.requestHeaders$.pipe(
          switchMap((headers: [string, string][]) => {
            return this.http.get(environment.ws + "/auth/profile", {
              headers: {
                ..._.fromPairs(headers),
              },
            });
          }),
        ),
      ),
      shareReplay(1),
      map((user: User) => new User().deserialize(user)),
      tap((user: User) => {
        // whenever the user changes, update the logged in orcid
        this.logged_in_orcid.next(user.orcid_id);
      }),
    );
    // Whenever the user changes, update the logged in orcid
    const windowMessageEventListener = (event: MessageEvent) => {
      const allowedOrigins = [
        new URL(environment.host).origin,
        new URL(environment.ws, location.origin).origin,
      ];
      if (allowedOrigins.includes(event.origin)) {
        if (_.isObject(event.data) && event.data["access_token"]) {
          const access_token = event.data["access_token"];

          if (access_token) {
            this.login(access_token);
            window.addEventListener("message", windowMessageEventListener);
          }
        }
      }
    };
    window.addEventListener("message", windowMessageEventListener);
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  private login(access_token) {
    this.setOrcidToken(access_token);

    // emit new login event with the current user info
    this.user$.pipe(takeUntil(this.destroy$)).subscribe((user) => {
      const loginData: LoginEventData = {
        user: user,
        isNew: user.newLogin,
        loginTime: new Date(),
      };
      console.log("Login Data:", loginData);
      console.log(`[Login Event] Logged in as ${user.orcid_id}`);
      this.loginEvent.next(loginData);
    });

    this.redirectAfterAuth();
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
          const href = `${environment.ws}/auth/token`;
          const request: Observable<Object> = this.http.get(href);
          return request;
        }
      }),
      pluck("token"),
      map((token: string) => {
        const [prefix, key] = token.split(" ");
        return key;
      }),
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
    this.logged_in_orcid.next(null);
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

  /**
   * Determines whether the currently logged-in user is the same as the passed ORCID identifier.
   *
   * @param requestedOrcid$ - An observable emitting the ORCID identifier of the profile being requested.
   * @returns An observable emitting `true` if the requested ORCID matches the logged-in user's ORCID, otherwise `false`.
   */
  public isOwnProfile(
    requestedOrcid$: Observable<string>,
  ): Observable<boolean> {
    return combineLatest([requestedOrcid$, this.loggedInOrcid$]).pipe(
      map(([routeOrcid, loggedInOrcid]) => {
        if (!loggedInOrcid) {
          return false;
        }
        return routeOrcid === loggedInOrcid;
      }),
      shareReplay(1),
    );
  }
}

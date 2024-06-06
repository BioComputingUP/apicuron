import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard  {
  constructor(public auth: AuthService, public router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.auth.loggedIn$.pipe(
      map((loggedIn: Boolean) => {
        // if the user is loggedIn we return true
        if (!!loggedIn) {
          return true;
        } else {
          // if the user is not loggedIn, we redirect him to the homepage
          return this.router.parseUrl("");
        }
      })
    );
  }
}

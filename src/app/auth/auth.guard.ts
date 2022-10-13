import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public auth: AuthService, public router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.auth.loggedIn$.pipe(
      map((loggedIn) => {
        if (loggedIn) {
          return true;
        } else {
          return this.router.parseUrl("");
        }
      })
    );
  }
}

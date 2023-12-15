import { Inject, inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { CuratorService } from "../curator.service";
import { catchError, map, switchMap } from "rxjs/operators";
import { AuthService } from "../../auth/auth.service";
import { combineLatest, of } from "rxjs";
import { User } from "../../models/User.model";
export const CuratorExistsGuard: CanActivateFn = function (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) {
  const orcid_id = route.paramMap.get("orcid_id");
  const authService = inject(AuthService);
  const curatorService = inject(CuratorService);

  return combineLatest([
    curatorService.get_curator(orcid_id as string),
    authService.loggedIn$,
  ]).pipe(
    switchMap(([user, loggedIn]) => {
      if (loggedIn) {
        return combineLatest([of(user), authService.user$]);
      } else {
        return combineLatest([of(user), of(null)]);
      }
    }),
    map(([user, connectedUser]: [User, User?]) => {
      if (user && user.privacy == "public") {
        return true;
      }
      if (connectedUser) {
        return connectedUser.orcid_id == user.orcid_id;
      }
      return false;
    })
  );
};

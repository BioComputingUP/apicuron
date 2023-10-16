import { Inject, inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { CuratorService } from "./curator.service";
import { catchError, map } from "rxjs/operators";
import { AuthService } from "../auth/auth.service";
import { combineLatest } from "rxjs";
export const CuratorExistsGuard: CanActivateFn = function (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) {
  const orcid_id = route.paramMap.get("orcid_id");
  const authService = inject(AuthService);
  const curatorService = inject(CuratorService);

  return combineLatest([
    curatorService.get_curator(orcid_id as string),
    authService.user$,
  ]).pipe(
    map(([user, connectedUser]) => {
      console.log({
        user,
        connectedUser,
      });
      if (
        user &&
        (user.privacy == "public" || user.orcid_id == connectedUser.orcid_id)
      ) {
        return true;
      } else {
        return inject(Router).parseUrl("");
      }
    })
  );
};

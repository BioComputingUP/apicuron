import { Inject, inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { CuratorService } from "./curator.service";
import { catchError, map } from "rxjs/operators";
export const CuratorExistsGuard: CanActivateFn = function (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) {
  const orcid_id = route.paramMap.get("orcid_id");
  return inject(CuratorService)
    .get_curator(orcid_id as string)
    .pipe(
      map((user) => {
        if(user && user.privacy == 'public'){
            return true;
        }else{
            return Inject(Router).parseUrl('')
        }
      })
    );
};

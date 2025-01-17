import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";


export const RedirectGuard: CanActivateFn = function (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    window.location.href = route.data.externalUrl;
    return true;
}
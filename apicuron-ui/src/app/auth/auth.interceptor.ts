import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { AuthService } from "./auth.service";
import { Observable } from "rxjs";
import { catchError, switchMap } from "rxjs/operators";
import { environment } from "../../environments/environment";
import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import * as _ from 'lodash'

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  requestHeaders$: Observable<[string, string][]>;

  constructor(protected authService: AuthService, protected router: Router) {
    this.requestHeaders$ = this.authService.requestHeaders$;
  }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // if we have the token_value
    // we add the authorization JWT token to the request headers

    return this.requestHeaders$.pipe(
      switchMap((authHeaders: [string, string][]) => {
        if (
          req.url.startsWith(environment.ws) &&
          !!authHeaders &&
          authHeaders.length > 0
        ) {
          const cloned = req.clone({
            setHeaders: _.fromPairs(authHeaders),
          });
          return next.handle(cloned).pipe(
            catchError((err: HttpErrorResponse, caught) => {
              if (err.status == 403) {
                this.authService.dropTokens();
                this.router.navigate(["/"]);
              }
              throw err;
            })
          );
        } else {
          return next.handle(req);
        }
      })
    );
  }
}

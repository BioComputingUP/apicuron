import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  NgcCookieConsentService,
  NgcStatusChangeEvent,
} from "ngx-cookieconsent";
import { Subject, Subscription, takeUntil } from "rxjs";
import { CookieManagerService } from "./cookie-manager/cookie-manager.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "apicuron-ui";
  private destroy$ = new Subject<void>();

  constructor(
    private cookieConsentService: NgcCookieConsentService,
    private cookieManager: CookieManagerService
  ) {}
  ngOnInit(): void {
    this.cookieConsentService.statusChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: NgcStatusChangeEvent) => {
        if (event.status === "allow") {
          this.cookieManager.grantConsent();
        } else {
          this.cookieManager.revokeConsent();
        }
      });
    this.cookieConsentService.revokeChoice$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.cookieManager.revokeConsent();
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
  }
}

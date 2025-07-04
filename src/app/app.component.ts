import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  NgcCookieConsentService,
  NgcStatusChangeEvent,
} from "ngx-cookieconsent";
import { Subscription } from "rxjs";
import { CookieManagerService } from "./cookie-manager/cookie-manager.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  title = "apicuron-ui";
  private subscriptions: Subscription[] = [];

  constructor(
    private cookieConsentService: NgcCookieConsentService,
    private cookieManager: CookieManagerService
  ) {}
  ngOnInit(): void {
    this.subscriptions.push(
      this.cookieConsentService.statusChange$.subscribe(
        (event: NgcStatusChangeEvent) => {
          if (event.status === "allow") {
            this.cookieManager.grantConsent();
          } else {
            this.cookieManager.revokeConsent();
          }
        }
      )
    );
    this.subscriptions.push(
      this.cookieConsentService.revokeChoice$.subscribe(() => {
        this.cookieManager.revokeConsent();
      })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }
}

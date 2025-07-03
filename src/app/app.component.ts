import { Component, OnInit } from "@angular/core";
import {
  NgcCookieConsentService,
  NgcInitializingEvent,
} from "ngx-cookieconsent";
import { Subscription } from "rxjs";
import { cookieConfig } from "src/config/cookies.config";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  title = "apicuron-ui";
  private initializingSubscription: Subscription;

  constructor(private cookieConsentService: NgcCookieConsentService) {}
  ngOnInit(): void {
    this.initializingSubscription =
      this.cookieConsentService.initializing$.subscribe(
        (event: NgcInitializingEvent) => {
          // the cookieconsent is initilializing... Not yet safe to call methods like `NgcCookieConsentService.hasAnswered()`
          console.log(`initializing: ${JSON.stringify(event)}`);
        }
      );
  }
}

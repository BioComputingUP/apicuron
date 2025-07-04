import { Injectable } from "@angular/core";
import { MatomoTracker } from "ngx-matomo-client";
import { BehaviorSubject } from "rxjs";

// Central service to manage cookie consent, inject the appropriate service and use its api to handle consent
@Injectable()
export class CookieManagerService {
  private consentStatus = new BehaviorSubject<boolean>(false);
  public consentStatus$ = this.consentStatus.asObservable();

  constructor(private readonly matomoTracker: MatomoTracker) {}

  /**
   * Grants consent for tracking to all services that use cookies.
   */
  grantConsent(): void {
    this.consentStatus.next(true);
    this.enableTracking();
  }

  revokeConsent(): void {
    this.consentStatus.next(false);
    this.disableTracking();
  }

  private enableTracking(): void {
    this.matomoTracker.rememberConsentGiven();
  }
  private disableTracking(): void {
    this.matomoTracker.forgetConsentGiven();
    this.matomoTracker.deleteCookies();
    this.consentStatus.next(false);
  }
}

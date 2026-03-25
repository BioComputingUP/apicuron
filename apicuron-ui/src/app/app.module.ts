import { HttpClientModule } from "@angular/common/http";
import { APP_ID, NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { AngularSvgIconModule } from "angular-svg-icon";
import { ToastrModule } from "ngx-toastr";
import { SentryModuleConfig } from "../config/sentry.config";
import { NavbarComponent } from "./alt-navbar/alt-navbar.component";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { AuthModule } from "./auth/auth.module";
import { AuthDropdownComponent } from "./components/auth-dropdown/auth-dropdown.component";
import { FootComponent } from "./foot/foot.component";
import { IndexModule } from "./index/index.module";
import { MainLayoutComponent } from "./main-layout/main-layout.component";
import { NotificationsDataModule } from "./notifications-data/notifications-data.module";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";

import { DialogModule } from "@angular/cdk/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { NgcCookieConsentModule } from "ngx-cookieconsent";
import { MatomoModule, MatomoRouterModule } from "ngx-matomo-client";
import { cookieConfig } from "../config/cookies.config";
import { CookieManagerService } from "./cookie-manager/cookie-manager.service";
import { DashboardModule } from "./dashboard/dashboard.module";
import { FirstLoginDialog } from "./first-login/first-login.component";
import { FirstPopupComponent } from "./first-login/first-popup/first-popup.component";
import { OrcidToUrl } from "./shared/orcid-to-url.pipe";
import { SharedUtilsModule } from "./shared/shared-utils.module";
@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent,
    MainLayoutComponent,
    FirstLoginDialog,
    FirstPopupComponent,
  ],
  imports: [
    SharedUtilsModule,
    BrowserModule,
    AppRoutingModule,
    AuthModule,
    NotificationsDataModule,
    // NotificationsModule,
    AuthDropdownComponent,
    ToastrModule.forRoot(),
    IndexModule,
    // TransferHttpCacheModule,
    BrowserAnimationsModule,
    // ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    // FormsModule,
    HttpClientModule,
    NavbarComponent,
    FootComponent,
    DashboardModule,
    DialogModule,
    AngularSvgIconModule.forRoot(),
    MatomoModule.forRoot({
      trackerUrl: "https://matomo.biocomputingup.it/matomo.php",
      siteId: "10",
      scriptUrl: "https://matomo.biocomputingup.it/matomo.js",
      requireConsent: "cookie",
    }),
    MatomoRouterModule,
    NgcCookieConsentModule.forRoot(cookieConfig),
  ],
  providers: [
    // *** Sentry ErrorHandler and Tracer Setup ***
    ...SentryModuleConfig,
    // *** end of sentry setup ***
    { provide: APP_ID, useValue: "serverApp" },
    OrcidToUrl,
    CookieManagerService,
  ],
  bootstrap: [AppComponent],
  exports: [RouterModule],
})
export class AppModule {}

import { BrowserModule } from "@angular/platform-browser";
import { NgModule, APP_ID } from "@angular/core";
import { RouterModule } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { FootComponent } from "./foot/foot.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { NavbarComponent } from "./alt-navbar/alt-navbar.component";
import { IndexModule } from "./index/index.module";
import { AuthModule } from "./auth/auth.module";
import { ToastrModule } from "ngx-toastr";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MainLayoutComponent } from "./main-layout/main-layout.component";
import { AuthDropdownComponent } from "./components/auth-dropdown/auth-dropdown.component";
import { NotificationsDataModule } from "./notifications-data/notifications-data.module";
import { SentryModuleConfig } from "../config/sentry.config";
import { FormsModule } from "@angular/forms";

import { FirstLoginDialog } from "./first-login/first-login.component";
import { DialogModule } from "@angular/cdk/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { FirstPopupComponent } from "./first-login/first-popup/first-popup.component";
import { DashboardModule } from "./dashboard/dashboard.module";
import { ErrorMessagePipe } from "./components/utils/error-messages/error-messages.pipe";
import { MatomoModule } from "ngx-matomo-client";
import { MatomoRouterModule } from "ngx-matomo-client";
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
    }),
    MatomoRouterModule,
  ],
  providers: [
    // *** Sentry ErrorHandler and Tracer Setup ***
    SentryModuleConfig,
    // *** end of sentry setup ***
    { provide: APP_ID, useValue: "serverApp" },
    OrcidToUrl,
  ],
  bootstrap: [AppComponent],
  exports: [RouterModule],
})
export class AppModule { }

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
import { MatomoModule } from "ngx-matomo";

import { FirstLoginDialog } from "./first-login/first-login.component";
import { DialogModule } from "@angular/cdk/dialog";
import { ReactiveFormsModule } from "@angular/forms";
import { FirstPopupComponent } from "./first-login/first-popup/first-popup.component";
import { DashboardModule } from "./dashboard/dashboard.module";
@NgModule({
  declarations: [AppComponent, PageNotFoundComponent, MainLayoutComponent, FirstLoginDialog, FirstPopupComponent],
  imports: [
    AppRoutingModule,
    AuthModule,
    NotificationsDataModule,
    // NotificationsModule,
    AuthDropdownComponent,
    ToastrModule.forRoot(),
    IndexModule,
    // TransferHttpCacheModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    // FormsModule,
    HttpClientModule,
    NavbarComponent,
    FootComponent,
    DashboardModule,
    DialogModule,
    AngularSvgIconModule.forRoot(),
    MatomoModule.forRoot({
      scriptUrl: "https://matomo.biocomputingup.it/matomo.js",
      trackers: [
        {
          trackerUrl: "https://matomo.biocomputingup.it/matomo.php",
          siteId: 10,
        },
      ],
      routeTracking: {
        enable: true,
      },
    }),
  ],
  providers: [
    // *** Sentry ErrorHandler and Tracer Setup ***
    SentryModuleConfig,
    // *** end of sentry setup ***
    { provide: APP_ID, useValue: 'serverApp' }
  ],
  bootstrap: [AppComponent],
  exports: [RouterModule],
})
export class AppModule {}

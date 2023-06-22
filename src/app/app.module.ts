import { BrowserModule } from "@angular/platform-browser";
import { NgModule, APP_INITIALIZER, ErrorHandler } from "@angular/core";
import {
  Router,
  RouterModule,
} from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { FootComponent } from "./foot/foot.component";
import { ApiComponent } from "./api/api.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { NavbarComponent } from "./alt-navbar/alt-navbar.component";
import { IndexModule } from "./index/index.module";
import { AuthModule } from "./auth/auth.module";
import { ToastrModule } from "ngx-toastr";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { CommonModule } from "@angular/common";
import { AuthDropdownComponent } from "./components/auth-dropdown/auth-dropdown.component";
import { NotificationsDataModule } from "./notifications-data/notifications-data.module";
import * as Sentry from "@sentry/angular-ivy";
import { NgxPopperModule } from "ngx-popper";
@NgModule({
  declarations: [
    AppComponent,
    FootComponent,
    ApiComponent,
    PageNotFoundComponent,
    MainLayoutComponent,
  ],
  imports: [
    AppRoutingModule,
    AuthModule,
    NotificationsDataModule,
    // NotificationsModule,
    AuthDropdownComponent,
    ToastrModule.forRoot(),
    IndexModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NavbarComponent,
    AngularSvgIconModule.forRoot(),
    // popper Integration
    NgxPopperModule.forRoot({
      disableDefaultStyling: true,
      disableAnimation: false,
    })
  ],
  providers: [
    // *** Sentry ErrorHandler and Tracer Setup ***
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: false,
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
    // *** end of sentry setup ***

  ],
  bootstrap: [AppComponent],
  exports: [RouterModule],
})
export class AppModule {}

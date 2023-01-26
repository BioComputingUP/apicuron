import { BrowserModule } from "@angular/platform-browser";
import { NgModule, SecurityContext } from "@angular/core";
import {
  RouterModule,
} from "@angular/router";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { FootComponent } from "./foot/foot.component";
import { ApiComponent } from "./api/api.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { AltNavbarComponent } from "./alt-navbar/alt-navbar.component";
import { IndexModule } from "./index/index.module";
import { AuthModule } from "./auth/auth.module";
import { ToastrModule } from "ngx-toastr";
import { AngularSvgIconModule } from "angular-svg-icon";
@NgModule({
  declarations: [
    AppComponent,
    FootComponent,
    ApiComponent,
    PageNotFoundComponent,
    AltNavbarComponent,
  ],
  imports: [
    AppRoutingModule,
    AuthModule,
    ToastrModule.forRoot(),
    IndexModule,
    ScrollToModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AngularSvgIconModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [RouterModule],
})
export class AppModule {}

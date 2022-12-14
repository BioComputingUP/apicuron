import { BrowserModule } from "@angular/platform-browser";
import { NgModule, SecurityContext } from "@angular/core";
import {
  RouterModule,
  Routes,
  UrlSegment,
  UrlMatchResult,
} from "@angular/router";
import { CdkTableModule } from "@angular/cdk/table";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { FootComponent } from "./foot/foot.component";
import { ApiComponent } from "./api/api.component";
import { LoginComponent } from "./login/login.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
// import { DetailsTableComponent } from "./details-table/details-table.component";
import { EditProfileComponent } from "./edit-profile/edit-profile.component";
import { NotRegisteredComponent } from "./not-registered/not-registered.component";
import { SwaggerUiComponent } from "./swagger-ui/swagger-ui.component";
import { AltNavbarComponent } from "./alt-navbar/alt-navbar.component";
import { IndexModule } from "./index/index.module";
import { CuratorModule } from "./curator/curator.module";
import { AuthModule } from "./auth/auth.module";
import { ToastrModule } from "ngx-toastr";
import { MarkdownModule, MarkedOptions } from "ngx-markdown";

@NgModule({
  declarations: [
    AppComponent,
    FootComponent,
    ApiComponent,
    LoginComponent,
    PageNotFoundComponent,
    // DetailsTableComponent,
    EditProfileComponent,
    NotRegisteredComponent,
    SwaggerUiComponent,
    AltNavbarComponent
  ],
  imports: [
    AppRoutingModule,
    AuthModule,
    ToastrModule.forRoot(),
    CuratorModule,
    IndexModule,
    ScrollToModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MarkdownModule.forRoot({ 
      loader: HttpClient, 
      sanitize: SecurityContext.NONE
    }),
    AppRoutingModule,
    CdkTableModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [RouterModule],
})
export class AppModule {}

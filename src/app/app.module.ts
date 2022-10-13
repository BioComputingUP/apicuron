import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import {
  RouterModule,
  Routes,
  UrlSegment,
  UrlMatchResult,
} from "@angular/router";
import { CdkTableModule } from "@angular/cdk/table";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
// import { CarouselModule } from "ngx-bootstrap/carousel";
// import { CollapseModule } from "ngx-bootstrap/collapse";
import { TabsModule } from "ngx-bootstrap/tabs";
import { PaginationModule } from "ngx-bootstrap/pagination";
// import { BsDropdownModule } from "ngx-bootstrap/dropdown";
// import { ButtonsModule } from "ngx-bootstrap/buttons";
// import { ModalModule } from "ngx-bootstrap/modal";
// import { TooltipModule } from "ngx-bootstrap/tooltip";
// import { AccordionModule } from "ngx-bootstrap/accordion";
import { AlertModule } from "ngx-bootstrap/alert";
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
import { ProgressbarModule } from "ngx-bootstrap/progressbar";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { FootComponent } from "./foot/foot.component";
import { ApiComponent } from "./api/api.component";
import { LoginComponent } from "./login/login.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { DetailsTableComponent } from "./details-table/details-table.component";
import { AlarmBannerComponent } from "./alarm-banner/alarm-banner.component";
import { EditProfileComponent } from "./edit-profile/edit-profile.component";
import { DocumentationComponent } from "./documentation/documentation.component";
import { NotRegisteredComponent } from "./not-registered/not-registered.component";
import { SwaggerUiComponent } from "./swagger-ui/swagger-ui.component";
import { AltNavbarComponent } from "./alt-navbar/alt-navbar.component";
import { IndexModule } from "./index/index.module";
import { CuratorModule } from "./curator/curator.module";
import { AuthModule } from "./auth/auth.module";

@NgModule({
  declarations: [
    AppComponent,
    FootComponent,
    ApiComponent,
    LoginComponent,
    PageNotFoundComponent,
    DetailsTableComponent,
    AlarmBannerComponent,
    EditProfileComponent,
    DocumentationComponent,
    NotRegisteredComponent,
    SwaggerUiComponent,
    AltNavbarComponent,
  ],
  imports: [
    AppRoutingModule,
    AuthModule,
    CuratorModule,
    IndexModule,
    ScrollToModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    CdkTableModule,
    TabsModule.forRoot(),
    AlertModule.forRoot(),
    PaginationModule.forRoot(),
    ProgressbarModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
  exports: [RouterModule],
})
export class AppModule {}

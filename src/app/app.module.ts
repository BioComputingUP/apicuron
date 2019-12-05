import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, UrlSegment, UrlMatchResult} from '@angular/router';
import {CdkTableModule} from '@angular/cdk/table';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { TabsModule } from 'ngx-bootstrap/tabs';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import {AlertModule} from 'ngx-bootstrap/alert';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { FootComponent } from './foot/foot.component';
import { BrowseComponent } from './browse/browse.component';
import { HelpComponent } from './help/help.component';
import { TutorialComponent } from './tutorial/tutorial.component';
import { ApiComponent } from './api/api.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { AboutComponent } from './about/about.component';
import { FeedbackComponent } from './feedback/feedback.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import {AuthService} from './services/auth.service';
import { ProfileComponent } from './profile/profile.component';
import { DetailsTableComponent } from './details-table/details-table.component';
import { AlarmBannerComponent } from './alarm-banner/alarm-banner.component';
import { ProteinsDetailTableComponent } from './proteins-detail-table/proteins-detail-table.component';
import { PubmedDetailTableComponent } from './pubmed-detail-table/pubmed-detail-table.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';
import { DashboardUserformComponent } from './dashboard-userform/dashboard-userform.component';



const appRoutes: Routes = [
  { path: 'browse', component: BrowseComponent},
  { path: 'login', component: LoginComponent},
  { path: 'feedback', component: FeedbackComponent},
  // { path: 'help', component: HelpComponent},
  // { path: 'tutorial', component: TutorialComponent},
  // { path: 'api', component: ApiComponent},
  // { path: 'statistics', component: StatisticsComponent},
  { path: 'about', component: AboutComponent},
  { path: 'setting', component: DashboardComponent},
  // { path: 'profile/:orcid', component: ProfileComponent},
  // { path: 'editprofile/:orcid', component: ProfileComponent},
  { path: '', component: HomeComponent },
  { path: '**', component: PageNotFoundComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    FootComponent,
    BrowseComponent,
    HelpComponent,
    TutorialComponent,
    ApiComponent,
    StatisticsComponent,
    AboutComponent,
    FeedbackComponent,
    LoginComponent,
    DashboardComponent,
    PageNotFoundComponent,
    ProfileComponent,
    DetailsTableComponent,
    AlarmBannerComponent,
    ProteinsDetailTableComponent,
    PubmedDetailTableComponent,
    EditProfileComponent,
    DashboardUserformComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      // { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    CdkTableModule,
    TabsModule.forRoot(),
    AlertModule.forRoot(),
    ProgressbarModule.forRoot(),
    PaginationModule.forRoot(),
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    AccordionModule.forRoot(),
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }

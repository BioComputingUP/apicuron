import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule, Routes, UrlSegment, UrlMatchResult} from '@angular/router';
import {CdkTableModule} from '@angular/cdk/table';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import {CollapseModule} from 'ngx-bootstrap/collapse';
import {TabsModule} from 'ngx-bootstrap/tabs';
import {PaginationModule} from 'ngx-bootstrap/pagination';
import {BsDropdownModule} from 'ngx-bootstrap/dropdown';
import {ButtonsModule} from 'ngx-bootstrap/buttons';
import {ModalModule} from 'ngx-bootstrap/modal';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {AccordionModule} from 'ngx-bootstrap/accordion';
import {AlertModule} from 'ngx-bootstrap/alert';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {NavbarComponent} from './navbar/navbar.component';
import {HomeComponent} from './home/home.component';
import {FootComponent} from './foot/foot.component';
import {BrowseComponent} from './browse/browse.component';
import {HelpComponent} from './help/help.component';
import {TutorialComponent} from './tutorial/tutorial.component';
import {ApiComponent} from './api/api.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {AboutComponent} from './about/about.component';
import {FeedbackComponent} from './feedback/feedback.component';
import {LoginComponent} from './login/login.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import {AuthService} from './services/auth.service';
import {ProfileComponent} from './profile/profile.component';
import {DetailsTableComponent} from './details-table/details-table.component';
import {AlarmBannerComponent} from './alarm-banner/alarm-banner.component';
import {ProteinsDetailTableComponent} from './proteins-detail-table/proteins-detail-table.component';
import {PubmedDetailTableComponent} from './pubmed-detail-table/pubmed-detail-table.component';
import {EditProfileComponent} from './edit-profile/edit-profile.component';
import {DashboardUserformComponent} from './dashboard-userform/dashboard-userform.component';
import {DocumentationComponent} from './documentation/documentation.component';


import {MatTableModule} from '@angular/material/table';
// import { BrowseTestComponent } from './browse-test/browse-test.component';
import { BrowseRibbonComponent } from './browse-ribbon/browse-ribbon.component';
import { DatabasesComponent } from './databases/databases.component';
import { BadgeMedalComponent } from './badge-medal/badge-medal.component';
import { LeaderboardCardComponent } from './leaderboard-card/leaderboard-card.component';
import { LeaderboardPageComponent } from './leaderboard-page/leaderboard-page.component';
import { BadgeViewComponent } from './badge-view/badge-view.component';
import { MedalViewComponent } from './medal-view/medal-view.component';
import { DatabaseComponent } from './database/database.component';
import { NotRegisteredComponent } from './not-registered/not-registered.component';
import { SwaggerUiComponent } from './swagger-ui/swagger-ui.component';

const appRoutes: Routes = [
  {path: 'curators', component: BrowseComponent},
  {path: 'login', component: LoginComponent},
  {path: 'feedback', component: FeedbackComponent},
  { path: 'help', component: HelpComponent},
  {path: 'databases', component: DatabasesComponent},
  {path: 'database', component: DatabaseComponent},
  // { path: 'leaderboard', component: LeaderboardPageComponent},
  // { path: 'api', component: ApiComponent},
  { path: 'swagger-ui', component: SwaggerUiComponent},
  {path: 'about', component: AboutComponent},
  {path: 'setting', component: DashboardComponent},
  {path: 'settings', component: DashboardComponent},
  { path: 'orcid/:orcid', component: ProfileComponent},
  // { path: 'editprofile/:orcid', component: ProfileComponent},
  {path: 'not_registered', component: NotRegisteredComponent},
  {path: '', component: HomeComponent},
  {path: '**', component: PageNotFoundComponent}
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
    DashboardUserformComponent,
    DocumentationComponent,
    // BrowseTestComponent,
    BrowseRibbonComponent,
    DatabasesComponent,
    BadgeMedalComponent,
    LeaderboardCardComponent,
    LeaderboardPageComponent,
    BadgeViewComponent,
    MedalViewComponent,
    DatabaseComponent,
    NotRegisteredComponent,
    SwaggerUiComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes, {
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
        scrollOffset: [0, 64]
      }
      // { enableTracing: true } // <-- debugging purposes only
    ),
    ScrollToModule.forRoot(),
    BrowserModule,
    BrowserAnimationsModule,
    BsDatepickerModule.forRoot(),
    CollapseModule.forRoot(),
    MatTableModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    CdkTableModule,
    TabsModule.forRoot(),
    AlertModule.forRoot(),
    CarouselModule.forRoot(),
    PaginationModule.forRoot(),
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    AccordionModule.forRoot(),
    ProgressbarModule.forRoot(),
  ],
  providers: [AuthService],
  bootstrap: [AppComponent]
})
export class AppModule {
}

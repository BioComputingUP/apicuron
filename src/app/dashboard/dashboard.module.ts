import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DatabaseUpdateComponent } from './database-update/database-update.component';
import { DatabasesModule } from '../databases/databases.module';
import { DashboardSidebarComponent } from './dashboard-sidebar/dashboard-sidebar.component';
import { SubmitReportComponent } from './submit-report/submit-report.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from './services/dashboard.service';
import { SubmitSingleComponent } from './submit-report/submit-single/submit-single.component';
import { SubmitBulkComponent } from './submit-report/submit-bulk/submit-bulk.component';
import { ManageTermsComponent } from './manage-terms/manage-terms.component';
import { TermsService } from './services/terms.service';
import { ManageAchievementsComponent } from './manage-achievements/manage-achievements.component';
import { AchievmentsDefService } from './manage-achievements/achievements.service';
import { SvgModule } from '../svg/svg.module';
import { ManageBadgesComponent } from './manage-achievements/manage-badges/manage-badges.component';
import { SelectTermsComponent } from './manage-achievements/select-terms.component';
import { ManageMedalsComponent } from './manage-achievements/manage-medals/manage-medals.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { DatabaseDashboardComponent } from './database-dashboard/database-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { DatabaseOverviewComponent } from './database-overview/database-overview.component'
import { AppModule } from '../app.module';
import { NavbarComponent } from '../alt-navbar/alt-navbar.component';
import { ReportsByDateChartComponent } from '../charts/reports-by-date-chart/reports-by-date-chart.component';

@NgModule({
  declarations: [
    DatabaseUpdateComponent,
    DashboardSidebarComponent,
    SubmitReportComponent,
    SubmitSingleComponent,
    SubmitBulkComponent,
    ManageTermsComponent,
    ManageAchievementsComponent,
    ManageBadgesComponent,
    ManageMedalsComponent,
    SelectTermsComponent,
    DatabaseDashboardComponent,
    UserDashboardComponent,
    DatabaseOverviewComponent,
  ],
  providers: [
    DashboardService,
    TermsService,
    AchievmentsDefService
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ReactiveFormsModule,
    DatabasesModule,
    AngularSvgIconModule,
    NavbarComponent,
    SvgModule,
    ReportsByDateChartComponent
  ]
})
export class DashboardModule { }

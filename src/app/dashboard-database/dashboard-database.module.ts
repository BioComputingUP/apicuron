import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DatabaseUpdateComponent } from './database-update/database-update.component';
import { DatabasesModule } from '../databases/databases.module';
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
import { DatabaseOverviewComponent } from './database-overview/database-overview.component'
import { NavbarComponent } from '../alt-navbar/alt-navbar.component';
import { SlideOverPanelComponent } from 'src/app/components/utils/slide-over-panel/slide-over-panel.component';
import { AuthDropdownComponent } from 'src/app/components/auth-dropdown/auth-dropdown.component';
import { DashboardDatabaseRoutingModule } from 'src/app/dashboard-database/dashboard-database-routing.module';

@NgModule({
  declarations: [
    DatabaseUpdateComponent,
    SubmitReportComponent,
    SubmitSingleComponent,
    SubmitBulkComponent,
    ManageTermsComponent,
    ManageAchievementsComponent,
    ManageBadgesComponent,
    ManageMedalsComponent,
    SelectTermsComponent,
    DatabaseOverviewComponent,
  ],
  providers: [
    DashboardService,
    TermsService,
    AchievmentsDefService
  ],
  imports: [
    CommonModule,
    DashboardDatabaseRoutingModule,
    SlideOverPanelComponent,
    AuthDropdownComponent,
    ReactiveFormsModule,
    DatabasesModule,
    AngularSvgIconModule,
    NavbarComponent,
    SvgModule,
  ]
})
export class DashboardDatabaseModule { }

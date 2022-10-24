import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
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


@NgModule({
  declarations: [
    DashboardComponent,
    DatabaseUpdateComponent,
    DashboardSidebarComponent,
    SubmitReportComponent,
    SubmitSingleComponent,
    SubmitBulkComponent,
    ManageTermsComponent,
  ],
  providers: [
    DashboardService,
    TermsService
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatabasesModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }

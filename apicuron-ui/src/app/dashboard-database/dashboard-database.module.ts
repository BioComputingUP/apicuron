import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DatabaseUpdateComponent } from "./database-update/database-update.component";
import { DatabasesModule } from "../databases/databases.module";
import { SubmitReportComponent } from "./submit-report/submit-report.component";
import { ReactiveFormsModule } from "@angular/forms";
import { DashboardService } from "./services/dashboard.service";
import { SubmitSingleComponent } from "./submit-report/submit-single/submit-single.component";
import { SubmitBulkComponent } from "./submit-report/submit-bulk/submit-bulk.component";
import { ManageTermsComponent } from "./manage-terms/manage-terms.component";
import { TermsService } from "./services/terms.service";
import { SvgModule } from "../svg/svg.module";
import { ManageBadgesComponent } from "./manage-badges/manage-badges.component";
import { ManageMedalsComponent } from "./manage-medals/manage-medals.component";
import { AngularSvgIconModule } from "angular-svg-icon";
import { DatabaseOverviewComponent } from "./database-overview/database-overview.component";
import { SlideOverPanelComponent } from "src/app/components/utils/slide-over-panel/slide-over-panel.component";
import { AuthDropdownComponent } from "src/app/components/auth-dropdown/auth-dropdown.component";
import { DashboardDatabaseRoutingModule } from "src/app/dashboard-database/dashboard-database-routing.module";
import { BadgeDefCardComponent } from "../components/badge-def-card/badge-def-card.component";
import { MedalDefCardComponent } from "../components/medal-def-card/medal-def-card.component";
import { MultiSelectModule } from "primeng/multiselect";
import { CalendarModule } from "primeng/calendar";
import { ReportsByDateChartComponent } from "../components/charts/reports-by-date-chart/reports-by-date-chart.component";
import { ResourceModule } from "../resource/resource.module";
import { FileUploadModule } from "primeng/fileupload";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { BlockUIModule } from "primeng/blockui";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
@NgModule({
  declarations: [
    DatabaseUpdateComponent,
    SubmitReportComponent,
    SubmitSingleComponent,
    SubmitBulkComponent,
    ManageTermsComponent,
    ManageBadgesComponent,
    ManageMedalsComponent,
    DatabaseOverviewComponent,
  ],
  providers: [DashboardService, TermsService, MessageService],
  imports: [
    CommonModule,
    DashboardDatabaseRoutingModule,
    SlideOverPanelComponent,
    AuthDropdownComponent,
    ReactiveFormsModule,
    DatabasesModule,
    AngularSvgIconModule,
    BadgeDefCardComponent,
    MedalDefCardComponent,
    ResourceModule,
    CalendarModule,
    FileUploadModule,
    MultiSelectModule,
    SvgModule,
    ReportsByDateChartComponent,
    ProgressSpinnerModule,
    BlockUIModule,
    ToastModule,
  ],
})
export class DashboardDatabaseModule {}

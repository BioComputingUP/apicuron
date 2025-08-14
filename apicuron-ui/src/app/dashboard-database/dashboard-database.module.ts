import { DialogModule } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AngularSvgIconModule } from "angular-svg-icon";
import { MessageService } from "primeng/api";
import { CalendarModule } from "primeng/calendar";
import { FileUploadModule } from "primeng/fileupload";
import { MultiSelectModule } from "primeng/multiselect";
import { ProgressSpinnerModule } from "primeng/progressspinner";
import { ToastModule } from "primeng/toast";
import { ConfirmationModule } from "../../../projects/apicuron-util/src/lib/confirmation";
import { AuthDropdownComponent } from "../components/auth-dropdown/auth-dropdown.component";
import { BadgeDefCardComponent } from "../components/badge-def-card/badge-def-card.component";
import { BadgeFormComponent } from "../components/badge-form/badge-form.component";
import { ReportsByDateChartComponent } from "../components/charts/reports-by-date-chart/reports-by-date-chart.component";
import { EmptyStateComponent } from "../components/empty-state/empty-state.component";
import { ResourceGroupCardComponent } from "../components/group-card/resource-group-card.component";
import { GroupCreateForm } from "../components/group-create-form/group-create-form.component";
import { MedalDefCardComponent } from "../components/medal-def-card/medal-def-card.component";
import { MedalFormComponent } from "../components/medal-form/medal-form.component";
import { PreferenceSelectorComponent } from "../components/preference-selector/preference-selector.component";
import { ErrorMessagePipe } from "../components/utils/error-messages/error-messages.pipe";
import { SlideOverPanelComponent } from "../components/utils/slide-over-panel/slide-over-panel.component";
import { SpinnerComponent } from "../components/utils/spinner/spinner.component";
import { DatabasesModule } from "../databases/databases.module";
import { PaginationComponent } from "../pagination/pagination.component";
import { ResourceModule } from "../resource/resource.module";
import { CuratorGroupsComponent } from "./curator-groups/curator-groups.component";
import { ModifyGroupsComponent } from "./curator-groups/modify-groups/modify-groups.component";
import { GroupsService } from "./curator-groups/services/groups.service";
import { DashboardDatabaseRoutingModule } from "./dashboard-database-routing.module";
import { DatabaseOverviewComponent } from "./database-overview/database-overview.component";
import { DatabaseUpdateComponent } from "./database-update/database-update.component";
import { LeaderboardPreferencesComponent } from "./database-update/leaderboard-preferences/leaderboard-preferences.component";
import { ManageBadgesComponent } from "./manage-badges/manage-badges.component";
import { ManageMedalsComponent } from "./manage-medals/manage-medals.component";
import { ManageTermsComponent } from "./manage-terms/manage-terms.component";
import { DashboardService } from "./services/dashboard.service";
import { TermsService } from "./services/terms.service";
import { SubmitBulkComponent } from "./submit-report/submit-bulk/submit-bulk.component";
import { SubmitReportComponent } from "./submit-report/submit-report.component";
import { SubmitSingleComponent } from "./submit-report/submit-single/submit-single.component";

@NgModule({
  declarations: [
    ErrorMessagePipe,
    DatabaseUpdateComponent,
    LeaderboardPreferencesComponent,
    SubmitReportComponent,
    SubmitSingleComponent,
    SubmitBulkComponent,
    ManageTermsComponent,
    ManageBadgesComponent,
    ManageMedalsComponent,
    DatabaseOverviewComponent,
    CuratorGroupsComponent,
    ModifyGroupsComponent,
  ],
  providers: [DashboardService, TermsService, MessageService, GroupsService],
  imports: [
    CommonModule,
    DialogModule,
    DashboardDatabaseRoutingModule,
    SlideOverPanelComponent,
    AuthDropdownComponent,
    FormsModule,
    ReactiveFormsModule,
    DatabasesModule,
    AngularSvgIconModule,
    BadgeDefCardComponent,
    MedalDefCardComponent,
    ResourceModule,
    CalendarModule,
    FileUploadModule,
    MultiSelectModule,
    ReportsByDateChartComponent,
    ProgressSpinnerModule,
    SpinnerComponent,
    ToastModule,
    BadgeFormComponent,
    MedalFormComponent,
    PaginationComponent,
    ResourceGroupCardComponent,
    GroupCreateForm,
    ConfirmationModule,
    EmptyStateComponent,
    PreferenceSelectorComponent,
    MatTooltipModule,
  ],
})
export class DashboardDatabaseModule {}

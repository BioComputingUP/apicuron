import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { DashboardRoutingModule } from "./dashboard-routing.module";
import { DatabasesModule } from "../databases/databases.module";
import { DashboardSidebarComponent } from "./dashboard-sidebar/dashboard-sidebar.component";
import { ReactiveFormsModule } from "@angular/forms";
import { SvgModule } from "../svg/svg.module";
import { AngularSvgIconModule } from "angular-svg-icon";
import { UserDashboardComponent } from "./user-dashboard/user-dashboard.component";
import { NavbarComponent } from "../alt-navbar/alt-navbar.component";
import { SlideOverPanelComponent } from "src/app/components/utils/slide-over-panel/slide-over-panel.component";
import { AuthDropdownComponent } from "src/app/components/auth-dropdown/auth-dropdown.component";
import { UserOverviewComponent } from "src/app/dashboard/user-overview/user-overview.component";
import { ReportsByDateChartComponent } from "src/app/components/charts/reports-by-date-chart/reports-by-date-chart.component";
import { UserOverviewPageService } from "./services/user-overview-page.service";
import { CalendarModule } from "primeng/calendar";
import { CategoriesPieChartComponent } from "../components/charts/categories-pie-chart/categories-pie-chart.component";
import { ProfileUpdateComponent } from "./profile-update/profile-update.component";
import { RouterModule } from "@angular/router";
import { SpinnerComponent } from "../components/utils/spinner/spinner.component";
import { UsersService } from "./services/users.service";
import { CuratorReportsDetailsComponent } from "../components/curator-reports-details/curator-reports-details.component";
import { CdkMenuModule } from "@angular/cdk/menu";
import { NumberCardComponent } from "../components/number-card/number-card.component";
import { DashboardService } from "./services/dashboard.service";
import { UserResourceDashboard } from "./user-resource-dashboard/page/user-resource-dashboard.component";
import { UserResourceDashboardService } from "./user-resource-dashboard/services/user-resource-dashboard.service";
import { BadgeCardComponent } from "../components/badge-card/badge-card.component";
@NgModule({
  declarations: [
    DashboardSidebarComponent,
    UserDashboardComponent,
    UserOverviewComponent,
    ProfileUpdateComponent,
    UserResourceDashboard,
  ],
  providers: [
    UserOverviewPageService,
    UsersService,
    DashboardService,
    UserResourceDashboardService,
  ],
  imports: [
    CommonModule,
    RouterModule,
    DashboardRoutingModule,
    SlideOverPanelComponent,
    AuthDropdownComponent,
    ReactiveFormsModule,
    DatabasesModule,
    CdkMenuModule,
    AngularSvgIconModule,
    NavbarComponent,
    CalendarModule,
    // SvgModule,
    BadgeCardComponent,
    SpinnerComponent,
    ReportsByDateChartComponent,
    CategoriesPieChartComponent,
    CuratorReportsDetailsComponent,
    NumberCardComponent,
  ],
})
export class DashboardModule {}

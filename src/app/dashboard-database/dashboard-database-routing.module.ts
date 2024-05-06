import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { AuthModule } from "../auth/auth.module";
import { DatabaseUpdateComponent } from "./database-update/database-update.component";
import { SubmitReportComponent } from "./submit-report/submit-report.component";
import { ManageTermsComponent } from "./manage-terms/manage-terms.component";
import { DatabaseOverviewComponent } from "src/app/dashboard-database/database-overview/database-overview.component";
import { UserDashboardComponent } from "src/app/dashboard/user-dashboard/user-dashboard.component";
import { ManageBadgesComponent } from "./manage-badges/manage-badges.component";
import { ManageMedalsComponent } from "./manage-medals/manage-medals.component";
import { CuratorGroupsComponent } from "./curator-groups/curator-groups.component";

const databaseDashboardRoutes: Routes = [
  {
    path: ":resource_id",
    component: UserDashboardComponent,
    children: [
      {
        path: "",
        component: DatabaseOverviewComponent,
        canActivate: [AuthGuard],
        title: "Resource Overview",
      },
      {
        path: "edit",
        component: DatabaseUpdateComponent,
        canActivate: [AuthGuard],
        title: "Edit Resource",
      },
      {
        path: "reports",
        component: SubmitReportComponent,
        canActivate: [AuthGuard],
        title: "Manage Resource Reports",
      },
      {
        path: "terms",
        component: ManageTermsComponent,
        canActivate: [AuthGuard],
        title: "Manage Resource Terms",
      },
      {
        path: "badges",
        component: ManageBadgesComponent,
        canActivate: [AuthGuard],
        title: "Manage Resource Badges",
      },
      {
        path: "medals",
        component: ManageMedalsComponent,
        canActivate: [AuthGuard],
        title: "Manage Resource Medals",
      },
      {
        path: "groups",
        component: CuratorGroupsComponent,
        canActivate: [AuthGuard],
        title: "Manage Resource groups",
      },
      { path: "**", redirectTo: "/" }, // redirects to the home page
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(databaseDashboardRoutes), AuthModule],
  exports: [RouterModule],
})
export class DashboardDatabaseRoutingModule {}

import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { AuthModule } from "../auth/auth.module";
import { UserDashboardComponent } from "./user-dashboard/user-dashboard.component";
import { UserOverviewComponent } from "src/app/dashboard/user-overview/user-overview.component";
// import { ProfileUpdateComponent } from './profile-update/profile-update.component';

const routes: Routes = [
  {
    path: "",
    // canActivate: [AuthGuard],
    component: UserDashboardComponent,
    children: [
      { path: "", component: UserOverviewComponent },
      // TODO: Implement
      // { path: 'profile', component: ProfileUpdateComponent }
    ],
  },
  {
    path: "database",
    loadChildren: () =>
      import("../dashboard-database/dashboard-database.module").then(
        (m) => m.DashboardDatabaseModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), AuthModule],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}

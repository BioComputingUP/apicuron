import { inject, NgModule } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  createUrlTreeFromSnapshot,
  Router,
  RouterModule,
  RouterStateSnapshot,
  Routes,
  UrlSegmentGroup,
  UrlTree,
} from "@angular/router";
import { AuthGuard } from "../auth/auth.guard";
import { AuthModule } from "../auth/auth.module";
import { UserDashboardComponent } from "./user-dashboard/user-dashboard.component";
import { UserOverviewComponent } from "src/app/dashboard/user-overview/user-overview.component";
import { ProfileUpdateComponent } from "./profile-update/profile-update.component";
import { UserResourceDashboard } from "./user-resource-dashboard/user-resource-dashboard.component";
import { DashboardService } from "./services/dashboard.service";
import { map } from "rxjs/operators";
// import { ProfileUpdateComponent } from './profile-update/profile-update.component';

const resourceExistsGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const dashboardService: DashboardService = inject(DashboardService);
  const resourceId = route.paramMap.get("resourceId");
  const router = inject(Router);
  return dashboardService.contributedResources$.pipe(
    map((resources) => {
      if (resources.length === 0) {
        return router.parseUrl("/dashboard");
      }

      if (
        resources.findIndex(
          (resource) => resource.resource_id === resourceId
        ) === -1
      ) {
        const resultRoute = createUrlTreeFromSnapshot(route, [
          "../" + resources[0].resource_id,
        ]);
        return resultRoute;
      }

      return true;
    })
  );
};

const routes: Routes = [
  {
    path: "",
    // canActivate: [AuthGuard],
    component: UserDashboardComponent,
    children: [
      {
        path: "",
        component: UserOverviewComponent,
        title: "Dashboard Overview",
      },
      { path: "profile", component: ProfileUpdateComponent },
      {
        path: "user/resources/:resourceId",
        canActivate: [AuthGuard, resourceExistsGuard],
        component: UserResourceDashboard,
      },
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

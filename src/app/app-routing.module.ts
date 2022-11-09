import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";
import { IndexComponent } from "./index/index.component";
import { NotRegisteredComponent } from "./not-registered/not-registered.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { SwaggerUiComponent } from "./swagger-ui/swagger-ui.component";

const routes: Routes = [
  { path: 'api', component: SwaggerUiComponent},
  {path: 'not_registered', component: NotRegisteredComponent},
  {
    path: "about",
    loadChildren: () =>
      import("./about/about.module").then((m) => m.AboutModule),
  },
  {
    path: "notifications",
    loadChildren: () =>
      import("./notifications/notifications.module").then((m) => m.NotificationsModule),
    canActivate: [AuthGuard]
  },
  {
    path: "help",
    loadChildren: () => import("./help/help.module").then((m) => m.HelpModule)
  },
  {
    path: "databases",
    loadChildren: () =>
      import("./databases/databases.module").then((m) => m.DatabasesModule),
  },
  // {
  //   path: "curators",
  //   loadChildren: () =>
  //     import("./curator/curator.module").then((m) => m.CuratorModule),
  // },
  
  // { path: 'curators/:orcid_id', component:CuratorPageComponent},

  {path: '', component: IndexComponent},
  { path: 'notifications', loadChildren: () => import('./notifications/notifications.module').then(m => m.NotificationsModule) },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
  {path: '**', component: PageNotFoundComponent},

];

@NgModule({
  imports: [
    // RouterModule.forChild(routes),
    // RouterModule.forRoot(routes, {
    //   relativeLinkResolution: "legacy",
    //   enableTracing: true,
    // }),
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "enabled",
      anchorScrolling: "enabled",
      scrollOffset: [0, 64],
      // relativeLinkResolution: "legacy",
      enableTracing: true, // <-- debugging purposes
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

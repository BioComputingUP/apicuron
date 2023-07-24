import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";
import { IndexComponent } from "./index/index.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { MainLayoutComponent } from "./main-layout/main-layout.component";

const routes: Routes = [
  {
    path: "about",
    component: MainLayoutComponent,
    loadChildren: () =>
      import("./about/about.module").then((m) => m.AboutModule),
  },
  {
    path: "notifications",
    component: MainLayoutComponent,
    loadChildren: () =>
      import("./notifications/notifications.module").then((m) => m.NotificationsModule),
    // component: NotificationsComponent,
    canActivate: [AuthGuard]
  },
  {
    path: "help",
    component: MainLayoutComponent,
    loadChildren: () => import("./help/help.module").then((m) => m.HelpModule)
  },
  {
    path: "databases",
    component: MainLayoutComponent,
    loadChildren: () =>
      import("./databases/databases.module").then((m) => m.DatabasesModule),
  },
  {
    path: "curators",
    component: MainLayoutComponent,
    loadChildren: () =>
      import("./curator/curator.module").then((m) => m.CuratorModule),
  },
  {
    path: "",
    component: MainLayoutComponent,
    loadChildren: () =>
      import("./index/index.module").then((m) => m.IndexModule),
  },

  // {
  //   path: '',
  //   component: MainLayoutComponent,
  //   children: [
  //     {
  //       path: '',
  //       component: IndexComponent,
  //     }
  //   ]
  // },
  { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'docs', component: MainLayoutComponent, loadChildren: () => import('./documentation/documentation.module').then(m => m.DocumentationModule) },
  { path: 'api', redirectTo: '/api/' },
  { path: '**', component: PageNotFoundComponent },

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
      paramsInheritanceStrategy: 'always',
      // relativeLinkResolution: "legacy",
      enableTracing: true, // <-- debugging purposes
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }

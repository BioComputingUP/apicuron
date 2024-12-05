import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";
import { IndexComponent } from "./index/index.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { MainLayoutComponent } from "./main-layout/main-layout.component";
import { environment } from "../environments/environment";
import { RedirectGuard } from "./guards/redirect.guard";
import { AppComponent } from "./app.component";
import { APP_BASE_HREF } from "@angular/common";

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
      import("./notifications/notifications.module").then(
        (m) => m.NotificationsModule
      ),
    // component: NotificationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "help",
    component: MainLayoutComponent,
    loadChildren: () => import("./help/help.module").then((m) => m.HelpModule),
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
    path: "registry",
    component: MainLayoutComponent,
    loadChildren: () =>
      import("./curator-registry/curator-registry.module").then((m) => m.CuratorRegistryModule),
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
  {
    path: "dashboard",
    loadChildren: () =>
      import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
  },
  {
    path: "docs",
    // Old Version of the docs
    component: MainLayoutComponent,
    loadChildren: () =>
      import("./documentation/documentation.module").then(
        (m) => m.DocumentationModule
      ),
    data: {
      disableGrowingNav: true,
    },
  },
  { path: "docs", redirectTo: "/docs/" },
  {
    path: "api",
    canActivate: [RedirectGuard],
    component: AppComponent,
    data: { externalUrl: "/api/" },
  },
  {
    path: "",
    component: MainLayoutComponent,
    loadChildren: () =>
      import("./index/index.module").then((m) => m.IndexModule),
  },
  { path: "**", component: PageNotFoundComponent },
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
      paramsInheritanceStrategy: "always",
      // relativeLinkResolution: "legacy",
      enableTracing: true, // <-- debugging purposes
    }),
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: environment.host,
    },
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

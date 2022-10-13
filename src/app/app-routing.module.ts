import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "./auth/auth.guard";
import { CuratorPageComponent } from "./curator/curator-page/curator-page.component";
import { IndexComponent } from "./index/index.component";
import { LoginComponent } from "./login/login.component";
import { NotRegisteredComponent } from "./not-registered/not-registered.component";
import { PageNotFoundComponent } from "./page-not-found/page-not-found.component";
import { SwaggerUiComponent } from "./swagger-ui/swagger-ui.component";

const routes: Routes = [
  // {path: 'curators', component: BrowseComponent},
  // {path: 'login', component: LoginComponent},
  // {path: 'feedback', component: FeedbackComponent},
  // { path: 'help', component: HelpComponent},
  // {path: 'database', component: DatabaseComponent},
  { path: 'api', component: SwaggerUiComponent},
  // {path: 'about', loadChildren: () => import('./about/about.module').then(m => m.AboutModule)},
  // {path: 'setting', component: DashboardComponent},
  // {path: 'settings', component: DashboardComponent},
  // { path: 'orcid/:orcid', component: ProfileComponent},
  {path: 'not_registered', component: NotRegisteredComponent},
  // {path: 'home', component: HomeComponent},
  {
    path: "about",
    loadChildren: () =>
      import("./about/about.module").then((m) => m.AboutModule),
  },
  {
    path: "help",
    loadChildren: () => import("./help/help.module").then((m) => m.HelpModule)
  },
  {
    path: "curators",
    loadChildren: () =>
      import("./curator/curator.module").then((m) => m.CuratorModule),
  },
  {
    path: "databases",
    loadChildren: () =>
      import("./databases/databases.module").then((m) => m.DatabasesModule),
  },
  // { path: 'curators/:orcid_id', component:CuratorPageComponent},

  {path: '', component: IndexComponent},
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

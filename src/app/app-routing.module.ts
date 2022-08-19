import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./index/index.module").then((m) => m.IndexModule),
  },
  {
    path: "about",
    loadChildren: () =>
      import("./about/about.module").then((m) => m.AboutModule),
  },
  { path: 'help', loadChildren: () => import('./help/help.module').then(m => m.HelpModule) },
  { path: 'curator', loadChildren: () => import('./curator/curator.module').then(m => m.CuratorModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: "legacy" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}

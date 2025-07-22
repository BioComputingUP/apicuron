import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SvgModule } from "../svg/svg.module";
import { CuratorPageComponent } from "./curator-page/curator-page.component";
import { CuratorsPageComponent } from "./curators-page.component";
import { CuratorExistsGuard } from "./guards/curator-exists.guard";
const routes: Routes = [
  { path: "", component: CuratorsPageComponent },
  {
    path: ":orcid_id",
    component: CuratorPageComponent,
    canActivate: [CuratorExistsGuard],
  },
  {
    path: ":orcid_id/:resource_id",
    component: CuratorPageComponent,
    canActivate: [CuratorExistsGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), SvgModule],
  exports: [RouterModule],
})
export class CuratorRoutingModule {}

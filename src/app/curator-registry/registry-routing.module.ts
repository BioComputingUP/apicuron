import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SvgModule } from "../svg/svg.module";
import { CuratorRegistryPageComponent } from "./curator-registry-page/curator-registry-page.component";

const routes: Routes = [
  { path: "", component: CuratorRegistryPageComponent },
  ];

@NgModule({
  imports: [RouterModule.forChild(routes), SvgModule],
  exports: [RouterModule],
})
export class CuratorRoutingModule {}

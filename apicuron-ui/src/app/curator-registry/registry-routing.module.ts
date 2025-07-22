import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CuratorRegistryPageComponent } from "./curator-registry-page/curator-registry-page.component";

const routes: Routes = [
  {
    path: "",
    component: CuratorRegistryPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistryRoutingModule {}


import { NgModule } from "@angular/core";
import { CuratorRegistryPageComponent } from "./curator-registry-page/curator-registry-page.component";
import { CommonModule } from "@angular/common";
import { RegistryRoutingModule } from "./registry-routing.module";



@NgModule({
  declarations: [
    CuratorRegistryPageComponent
  ],
  imports: [
    CommonModule,
    RegistryRoutingModule
  ]
})
export class CuratorRegistryModule { }

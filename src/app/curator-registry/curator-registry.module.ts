import { NgModule } from "@angular/core";
import { CuratorRegistryPageComponent } from "./curator-registry-page/curator-registry-page.component";
import { CommonModule } from "@angular/common";
import { RegistryRoutingModule } from "./registry-routing.module";
import { RegistryCardComponent } from './registry-card/registry-card.component';
import { CuratorRegistryService } from "./curator-registry.service";



@NgModule({
  declarations: [
    CuratorRegistryPageComponent,
    RegistryCardComponent
  ],
  imports: [
    CommonModule,
    RegistryRoutingModule
  ],
  providers:[CuratorRegistryService]
})
export class CuratorRegistryModule { }

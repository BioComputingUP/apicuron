import { NgModule } from "@angular/core";
import { CuratorRegistryPageComponent } from "./curator-registry-page/curator-registry-page.component";
import { CommonModule } from "@angular/common";
import { RegistryRoutingModule } from "./registry-routing.module";
import { RegistryCardComponent } from './registry-card/registry-card.component';
import { CuratorRegistryService } from "./curator-registry.service";
import { CuratorModule } from "../curator/curator.module";
import { ApicuronUtilModule } from "projects/apicuron-util/src/public-api";



@NgModule({
  declarations: [
    CuratorRegistryPageComponent,
    RegistryCardComponent
  ],
  imports: [
    CommonModule,
    RegistryRoutingModule,
    CuratorModule,
    ApicuronUtilModule
    
  ],
  providers:[CuratorRegistryService]
})
export class CuratorRegistryModule { }

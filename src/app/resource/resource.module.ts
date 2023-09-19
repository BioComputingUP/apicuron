import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PartnerResourceComponent } from "./partner-resource/partner-resource.component";
import { RouterModule } from "@angular/router";
import { ResourcesService } from "./service/resources.service";
import { HttpClientModule } from "@angular/common/http";

@NgModule({
  declarations: [PartnerResourceComponent],
  providers: [ResourcesService],
  imports: [CommonModule, HttpClientModule, RouterModule],
  exports: [PartnerResourceComponent],
})
export class ResourceModule {}

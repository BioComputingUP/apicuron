import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PartnerResourceComponent } from "./partner-resource/partner-resource.component";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [PartnerResourceComponent],
  imports: [CommonModule, RouterModule],
  exports: [PartnerResourceComponent],
})
export class ResourceModule {}

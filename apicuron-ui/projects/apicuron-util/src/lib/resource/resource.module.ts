import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ResourcesService } from "./resources.service";

@NgModule({
  imports: [HttpClientModule],
  providers: [ResourcesService],
})
export class ResourceModule {}

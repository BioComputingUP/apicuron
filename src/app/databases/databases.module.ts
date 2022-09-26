import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ResourceModule } from "../resource/resource.module";
import { DatabasesPageComponent } from "./databases-page/databases-page.component";
import { DatabasesRoutingModule } from "./databases-routing.module";
import { DatabasePageComponent } from "./database-page/database-page.component";
import { CuratorModule } from "../curator/curator.module";
import { SvgModule } from "../svg/svg.module";
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
@NgModule({
  declarations: [DatabasesPageComponent, DatabasePageComponent],
  imports: [
    ScrollToModule,
    SvgModule,
    CommonModule,
    ResourceModule,
    RouterModule,
    DatabasesRoutingModule,
    CuratorModule,
  ],
  exports: [DatabasesPageComponent],
})
export class DatabasesModule {}

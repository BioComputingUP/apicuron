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
import { DatabaseCreateComponent } from "./database-create/database-create.component";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthModule } from "../auth/auth.module";
import { DatabasesService } from "./services/databases.service";
@NgModule({
  declarations: [
    DatabasesPageComponent,
    DatabasePageComponent,
    DatabaseCreateComponent,
  ],
  imports: [
    CommonModule,
    DatabasesRoutingModule,
    AuthModule,
    ScrollToModule,
    SvgModule,
    ResourceModule,
    RouterModule,
    CuratorModule,
    ReactiveFormsModule,
  ],
  providers:[DatabasesService],
  exports: [DatabasesPageComponent],
})
export class DatabasesModule {}

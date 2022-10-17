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
import { DatabaseCreateComponent } from './database-create/database-create.component';
import { ReactiveFormsModule } from "@angular/forms";
import { AuthModule } from "../auth/auth.module";
import { DatabaseUpdateComponent } from './database-update/database-update.component';
import { DashboardSidebarComponent } from './dashboard-sidebar/dashboard-sidebar.component';
@NgModule({
  declarations: [DatabasesPageComponent, DatabasePageComponent, DatabaseCreateComponent, DatabaseUpdateComponent, DashboardSidebarComponent],
  imports: [
    AuthModule,
    ScrollToModule,
    SvgModule,
    CommonModule,
    ResourceModule,
    RouterModule,
    DatabasesRoutingModule,
    CuratorModule,
    ReactiveFormsModule
  ],
  exports: [DatabasesPageComponent],
})
export class DatabasesModule {}

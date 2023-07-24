import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DatabaseCreateComponent } from "./database-create/database-create.component";
import { DatabasePageComponent } from "./database-page/database-page.component";
import { DatabasesPageComponent } from "./databases-page/databases-page.component";
import { AuthGuard } from "../auth/auth.guard";

const routes: Routes = [
  { path: "", component: DatabasesPageComponent },
  { path: "create", component: DatabaseCreateComponent, canActivate:[AuthGuard] },
  { path: ":resource_id", component: DatabasePageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatabasesRoutingModule {}

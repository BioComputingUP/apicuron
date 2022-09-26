import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DatabasePageComponent } from "./database-page/database-page.component";
import { DatabasesPageComponent } from "./databases-page/databases-page.component";

const routes: Routes = [
  { path: "", component: DatabasesPageComponent },
  { path: ":resource_id", component: DatabasePageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DatabasesRoutingModule {}

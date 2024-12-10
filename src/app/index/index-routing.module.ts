import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { IndexComponent } from "./index.component";
import { PostAuthPageComponent } from "./post-auth/post-auth-page/post-auth-page.component";

const routes: Routes = [
  { path: "", component: IndexComponent },
  { path: "first", component: PostAuthPageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndexRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CuratorComponent } from './curator.component';

const routes: Routes = [{ path: '', component: CuratorComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CuratorRoutingModule { }
